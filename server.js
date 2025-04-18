// require("dotenv").config();
// const path = require("path");
// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const { ApolloServer } = require("apollo-server-express");
// const { createServer } = require("http");
// const { graphqlUploadExpress } = require("graphql-upload");
// const { makeExecutableSchema } = require("@graphql-tools/schema");
// const cookieParser = require("cookie-parser");
// const cron = require("node-cron");

// // Import your route handlers, type definitions, resolvers, and utility functions
// const paymentRoute = require("./Routes/paymentRoute");
// const resolvers = require("./GraphQL/Resolver/index");
// const typeDefs = require("./GraphQL/TypeDef/index");
// const DatabaseConnection = require("./Config/DataBase");
// const { authenticateUser } = require("./Utilities/authUtils");

// const app = express();

// /* ---------------------------- Middleware setup ---------------------------- */
// const allowedOrigins = [
//   "https://high-style-4nxz.vercel.app",
//   "https://high-style.vercel.app",
//   "http://localhost:3000",
//   "http://localhost:3001",
//   "https://highstyle-production.up.railway.app", // Add Railway URL
// ];

// app.use((req, res, next) => {
//   const origin = req.headers.origin;
//   if (allowedOrigins.includes(origin)) {
//     res.setHeader("Access-Control-Allow-Origin", origin);
//     res.setHeader("Access-Control-Allow-Credentials", "true"); // Required for cookies
//     res.setHeader(
//       "Access-Control-Allow-Headers",
//       "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//     );
//     res.setHeader(
//       "Access-Control-Allow-Methods",
//       "GET, POST, OPTIONS, PUT, DELETE"
//     );
//   }
//   next();
// });

// app.use(cookieParser());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));
// app.use("/", paymentRoute);

// app.get("/dev", (req, res) => {
//   res.send("Server is running successfully"); // Test endpoint
// });

// /* -------------------------- GraphQL schema setup -------------------------- */
// const schema = makeExecutableSchema({
//   typeDefs,
//   resolvers,
// });

// const server = new ApolloServer({
//   schema,
//   context: async ({ req, res }) => {
//     if (!req) {
//       return { userId: null, user: { role: "cron-job" } };
//     }

//     const token = req.cookies.token || process.env.TOKEN;
//     const { userId, user } = await authenticateUser(token);
//     return { userId, user, res };
//   },
//   formatError: (err) => {
//     console.error(err);
//     0;
//     return {
//       success: false,
//       message: err.message || "Internal Server Error",
//     };
//   },
//   introspection: true,
//   csrfPrevention: true,
// });

// /* ------------------------ Error handling middleware ----------------------- */
// app.use((err, req, res, next) => {
//   const statusCode = err.statusCode || 500;
//   const message = err.message || "Error in Server";
//   res.status(statusCode).json({ message });
// });

// /* -------------------------------- cron jobs ------------------------------- */
// cron.schedule("0 0 */5 * *", async () => {
//   try {
//     const response = await server.executeOperation({
//       query: `
//         mutation {
//           deleteOldPendingOrders
//         }
//       `,
//     });

//     if (response.errors) {
//       console.error("Error during cron job execution:", response.errors);
//     } else {
//       console.log(
//         `Deleted ${response.data.deleteOldPendingOrders} old pending orders`
//       );
//     }
//   } catch (error) {
//     console.error("Cron job failed to delete orders:", error);
//   }
// });

// /* ------------------------------ Start server ------------------------------ */
// const startServer = async () => {
//   try {
//     await server.start();
//     server.applyMiddleware({
//       app,
//       cors: false, // We already used express CORS middleware
//     });

//     const httpServer = createServer(app);
//     const PORT = process.env.PORT || 2024;

//     httpServer.listen(PORT, () => {
//       DatabaseConnection();
//       console.log(
//         `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
//       );
//     });
//   } catch (error) {
//     console.error("Failed to start the server:", error);
//   }
// };

// startServer();

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

/* ---------------------------- CORS Configuration ---------------------------- */
const allowedOrigins = [
  "https://high-style-4nxz-i7ter0x9u-baraa-abdullatifs-projects-0de89e64.vercel.app",
  "https://high-style.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "https://highstyle-production.up.railway.app",
  "https://73e8-2405-201-200c-b0e9-26b1-a2c3-cf4b-5c0e.ngrok-free.app",
  "https://highstyle-production-c6da.up.railway.app", // Add your Railway URL
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  exposedHeaders: ["set-cookie"], // Crucial for cookies
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cookie", // Added Cookie header
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

/* ---------------------------- Other Middleware ---------------------------- */
app.use(cookieParser());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));
app.use("/", paymentRoute);

/* -------------------------- GraphQL Schema Setup -------------------------- */
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
  csrfPrevention: false, // Disabled to work with CORS properly
});

/* ------------------------ Error Handling Middleware ----------------------- */
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Handle CORS errors specifically
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS policy: Request not allowed",
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({ success: false, message });
});

/* -------------------------------- Cron Jobs ------------------------------- */
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

/* ------------------------------ Start Server ------------------------------ */
const startServer = async () => {
  try {
    await server.start();

    // Apply Apollo middleware with CORS disabled (already handled by express)
    server.applyMiddleware({
      app,
      cors: false,
      path: "/graphql",
    });

    const httpServer = createServer(app);
    const PORT = process.env.PORT || 2024;

    httpServer.listen(PORT, () => {
      DatabaseConnection();
      console.log(`🚀 Server ready at http://localhost:${PORT}`);
      console.log(
        `🚀 GraphQL ready at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
};

startServer();
