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
const allowedOrigins = [
  "https://high-style-4nxz-i7ter0x9u-baraa-abdullatifs-projects-0de89e64.vercel.app",
  "https://high-style.vercel.app",
  "http://localhost:3000",
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log("Origin:", origin); // Log the origin for debugging
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// Apply CORS and other middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));
app.use("/", paymentRoute);

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
    0;
    return {
      success: false,
      message: err.message || "Internal Server Error",
    };
  },
  introspection: true,
  csrfPrevention: true,
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
      cors: false, // We already used express CORS middleware
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
