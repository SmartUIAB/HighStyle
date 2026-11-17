"use strict";
const path = require("node:path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const { ApolloServer } = require("apollo-server-express");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { graphqlUploadExpress } = require("graphql-upload");
const { GraphQLError } = require("graphql");
const typeDefs = require("./GraphQL/TypeDef");
const resolvers = require("./GraphQL/Resolver");
const paymentRoute = require("./Routes/paymentRoute");
const { authenticateUser } = require("./Utilities/authUtils");
const { allowedOrigins } = require("./Security/http");
const { requireStaff } = require("./Security/access");

function buildSchema() { return makeExecutableSchema({ typeDefs, resolvers }); }
function queryBudget(context) {
  return { OperationDefinition(operation) {
    let count = 0;
    let exceeded = false;
    function walk(selectionSet, depth, fragments = new Set()) {
      for (const selection of selectionSet?.selections || []) {
        if (exceeded) return;
        if (selection.kind === "Field") {
          count++;
          if (depth >= 12 || count > 250) { exceeded = true; break; }
          walk(selection.selectionSet, depth + 1, fragments);
        } else if (selection.kind === "FragmentSpread") {
          const name = selection.name.value;
          if (!fragments.has(name)) walk(context.getFragment(name)?.selectionSet, depth, new Set([...fragments, name]));
        } else walk(selection.selectionSet, depth, fragments);
      }
    }
    walk(operation.selectionSet, 0);
    if (exceeded) context.reportError(new GraphQLError("Query exceeds the allowed complexity"));
  } };
}
function formatError(error) {
  const status = error.originalError?.statusCode;
  const codes = { 400: "BAD_USER_INPUT", 401: "UNAUTHENTICATED", 403: "FORBIDDEN", 404: "NOT_FOUND", 409: "CONFLICT", 429: "RATE_LIMITED", 503: "SERVICE_UNAVAILABLE" };
  const known = codes[status] || ["GRAPHQL_VALIDATION_FAILED", "GRAPHQL_PARSE_FAILED", "BAD_USER_INPUT"].includes(error.extensions?.code);
  return { message: known ? error.message : "Internal server error", path: error.path, extensions: { code: codes[status] || (known ? error.extensions.code : "INTERNAL_SERVER_ERROR") } };
}
async function requestIdentity(req) {
  if (req.verifiedIdentity) return req.verifiedIdentity;
  const bearer = /^Bearer (\S+)$/i.exec(req.headers.authorization || "")?.[1];
  return authenticateUser(req.cookies?.token || bearer);
}

async function createApp() {
  const app = express();
  app.disable("x-powered-by");
  const trustedHops = Number(process.env.TRUST_PROXY_HOPS || 0);
  if (!Number.isInteger(trustedHops) || trustedHops < 0 || trustedHops > 5) throw new Error("Invalid TRUST_PROXY_HOPS");
  app.set("trust proxy", trustedHops);
  app.use((req, res, next) => { res.setHeader("X-Content-Type-Options", "nosniff"); res.setHeader("Referrer-Policy", "no-referrer"); next(); });
  app.get("/health/live", (_, res) => res.json({ status: "alive" }));
  app.get("/health/ready", (_, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({ status: mongoose.connection.readyState === 1 ? "ready" : "not-ready" }));
  // Stripe uses server-to-server requests and the original signed bytes.
  app.use(paymentRoute);
  const origins = allowedOrigins();
  app.use(cors({ credentials: true, origin(origin, callback) {
    if (!origin || origins.has(origin)) return callback(null, true);
    callback(Object.assign(new Error("Origin is not allowed"), { statusCode: 403 }));
  } }));
  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));
  app.use("/uploads", (_, res, next) => { res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox"); next(); }, express.static(path.join(__dirname, "uploads"), { dotfiles: "deny" }));
  app.use("/graphql", (req, res, next) => {
    if (!req.is("multipart/form-data")) return next();
    requestIdentity(req).then(identity => { requireStaff(identity); req.verifiedIdentity = identity; next(); }).catch(next);
  }, graphqlUploadExpress({ maxFileSize: 8 * 1024 * 1024, maxFiles: 5 }));
  const server = new ApolloServer({
    schema: buildSchema(), csrfPrevention: true, introspection: process.env.NODE_ENV !== "production", validationRules: [queryBudget],
    context: async ({ req, res }) => ({ ...await requestIdentity(req), res, ip: req.ip }), formatError,
  });
  await server.start();
  server.applyMiddleware({ app, path: "/graphql", cors: false, bodyParserConfig: false });
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status = error.statusCode || error.status || 500;
    res.status(status >= 400 && status < 600 ? status : 500).json({ message: status < 500 ? error.message : "Service unavailable" });
  });
  return { app, server };
}
module.exports = { createApp, buildSchema, formatError, queryBudget };
