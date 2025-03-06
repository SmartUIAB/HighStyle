require("dotenv").config();
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { ApolloServer } = require("apollo-server-express");
const { createServer } = require("http");
const { graphqlUploadExpress } = require("graphql-upload");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");

// Import your route handlers, type definitions, resolvers, and utility functions
const paymentRoute = require("./Routes/paymentRoute");
const resolvers = require("./GraphQL/Resolver/index");
const typeDefs = require("./GraphQL/TypeDef/index");
const DatabaseConnection = require("./Config/DataBase");
const { authenticateUser } = require("./Utilities/authUtils");

const app = express();

/* ---------------------------- Middleware setup ---------------------------- */
const allowedOrigins = ["http://localhost:3001", "http://localhost:3000"]; // List of allowed origins

app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || true) {
        //remove true from if condition in production mode
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use("/", paymentRoute);
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

/* -------------------------- GraphQL schema setup -------------------------- */
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const server = new ApolloServer({
  schema,
  context: async ({ req, res }) => {
    if (!req) {
      return { userId: null, user: { role: "cron-job" } };
    }

    const token = req.cookies.token || process.env.TOKEN;
    const { userId, user } = await authenticateUser(token);
    return { userId, user, res };
  },
  formatError: (err) => {
    console.error(err);
    return {
      success: false,
      message: err.message || "Internal Server Error",
    };
  },
  introspection: true,
  uploads: {
    maxFileSize: 10000000,
    maxFiles: 10,
    csrfPrevention: true,
  },
});

/* ------------------------ Error handling middleware ----------------------- */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Error in Server";
  res.status(statusCode).json({ message });
});

/* -------------------------------- cron jobs ------------------------------- */
cron.schedule("0 0 */5 * *", async () => {
  try {
    const response = await server.executeOperation({
      query: `
        mutation {
          deleteOldPendingOrders
        }
      `,
    });

    if (response.errors) {
      console.error("Error during cron job execution:", response.errors);
    } else {
      console.log(
        `Deleted ${response.data.deleteOldPendingOrders} old pending orders`
      );
    }
  } catch (error) {
    console.error("Cron job failed to delete orders:", error);
  }
});

/* ------------------------------ Start server ------------------------------ */
const startServer = async () => {
  try {
    await server.start();
    server.applyMiddleware({
      app,
      cors: false, //Disable Apollo Server CORS configuration to use Express CORS configuration
    });

    const httpServer = createServer(app);
    const PORT = process.env.PORT || 2024;

    httpServer.listen(PORT, () => {
      DatabaseConnection();
      console.log(
        `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
  }
};

startServer();
