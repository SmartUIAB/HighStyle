"use strict";
// One-time, reviewable migration. It is not part of application startup.
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8").replace(/\r\n/g, "\n");
const write = (name, text) => fs.writeFileSync(path.join(root, name), text);
function replace(name, before, after) {
  const source = read(name);
  if (!source.includes(before)) throw new Error(`Migration anchor not found: ${name}: ${before.slice(0, 60)}`);
  write(name, source.replace(before, after));
}
function manifest(name, keep, additions, removeDev = []) {
  const file = `${name}/package.json`;
  const pkg = JSON.parse(read(file));
  const original = pkg.dependencies || {};
  pkg.dependencies = Object.fromEntries(keep.map(key => {
    if (!(key in original) && !(key in additions)) throw new Error(`Unknown dependency ${key}`);
    return [key, additions[key] || original[key]];
  }));
  Object.assign(pkg.dependencies, additions);
  pkg.dependencies = Object.fromEntries(Object.entries(pkg.dependencies).sort(([a], [b]) => a.localeCompare(b)));
  pkg.devDependencies ||= {};
  for (const key of removeDev) delete pkg.devDependencies[key];
  pkg.engines = { node: ">=22.16 <25" };
  pkg.private = true;
  if (name !== "API") {
    pkg.scripts.build = "next build --webpack";
    pkg.scripts.dev = "next dev --webpack";
    pkg.scripts.typecheck = "tsc --noEmit";
    delete pkg.scripts.lint;
    pkg.devDependencies.typescript = "^5.9.0";
    pkg.devDependencies["@types/node"] = "^22.0.0";
    pkg.devDependencies["@types/react"] = "^18.3.0";
    pkg.devDependencies["@types/react-dom"] = "^18.3.0";
  }
  if (name === "frontend") pkg.name = "highstyle-storefront";
  if (name === "API") pkg.name = "highstyle-api";
  if (name === "backend") pkg.name = "highstyle-admin";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
}
manifest("API", ["@graphql-tools/schema", "bcryptjs", "cookie-parser", "cors", "dotenv", "express", "fuse.js", "graphql", "jsonwebtoken", "lodash", "mongoose", "nodemailer", "stripe"], {
  "@apollo/server": "^5.5.2", "@as-integrations/express4": "^1.1.2", "@graphql-tools/schema": "^10.0.0", "bcryptjs": "^3.0.0", "cookie-parser": "^1.4.7", "cors": "^2.8.5", "dotenv": "^17.0.0", "express": "^4.22.3", "graphql": "^16.11.0", "graphql-tag": "^2.12.7", "graphql-upload": "^17.1.0", "jsonwebtoken": "^9.0.2", "lodash": "^4.17.24", "mongoose": "^8.24.10", "nodemailer": "^10.6.0", "stripe": "^23.1.0"
});
manifest("frontend", ["@apollo/client", "@stripe/react-stripe-js", "@stripe/stripe-js", "@types/react-slick", "@types/reactstrap", "axios", "bootstrap", "bootstrap-scss", "deepmerge", "graphql", "i18next", "i18next-browser-languagedetector", "i18next-http-backend", "next", "react", "react-18-image-lightbox", "react-bootstrap", "react-content-loader", "react-countdown", "react-dom", "react-helmet", "react-i18next", "react-range", "react-slick", "react-tabs", "react-toastify", "reactstrap", "sass"], {
  "next": "16.4.6", "react": "^18.3.1", "react-dom": "^18.3.1", "axios": "^1.21.1", "lodash": "^4.17.24", "i18next-http-backend": "^4.0.4", "graphql": "^16.11.0", "react-slick": "^0.31.0"
});
manifest("backend", ["@apollo/client", "@emotion/react", "@emotion/styled", "@mui/icons-material", "@mui/material", "@reduxjs/toolkit", "@uiw/react-md-editor", "apexcharts", "apollo-upload-client", "axios", "bootstrap", "chart.js", "graphql", "i18next", "i18next-browser-languagedetector", "i18next-resources-to-backend", "js-cookie", "jspdf", "jspdf-autotable", "next", "react", "react-apexcharts", "react-chartjs-2", "react-countup", "react-data-table-component", "react-datepicker", "react-dom", "react-dropzone-uploader", "react-feather", "react-google-charts", "react-i18next", "react-rating-stars-component", "react-redux", "react-slick", "react-tabs", "react-toastify", "reactstrap", "sass", "styled-components", "yup"], {
  "next": "16.4.6", "react": "^18.3.1", "react-dom": "^18.3.1", "axios": "^1.21.1", "js-cookie": "^3.0.6", "jspdf": "4.2.1", "jspdf-autotable": "5.0.9", "graphql": "^16.11.0", "styled-components": "^6.4.0", "react-slick": "^0.31.0"
}, ["eslint", "eslint-config-next", "@types/node-fetch"]);
// Retire the vulnerable magnifier without changing the image contract.
const magnifiers = [];
function walk(dir) { for (const e of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) { const p = `${dir}/${e.name}`; if (e.isDirectory()) { if (!["node_modules", ".next"].includes(e.name)) walk(p); } else if (/\.[jt]sx?$/.test(p)) { const s = read(p); if (/from ["']react-image-magnify["']/.test(s)) magnifiers.push(p); } } }
walk("frontend");
for (const file of magnifiers) {
  const s = read(file).replace(/import ReactImageMagnify from ["']react-image-magnify["'];?/, 'const ReactImageMagnify = ({ smallImage }) => <img src={smallImage.src} alt={smallImage.alt || "Product image"} width={smallImage.width} height={smallImage.height} style={{ maxWidth: "100%", height: "auto" }} />;');
  write(file, s);
}
for (const file of fs.readdirSync(path.join(root, "API/GraphQL/TypeDef"))) {
  if (!file.endsWith(".js")) continue;
  const name = `API/GraphQL/TypeDef/${file}`;
  write(name, read(name).replace(/const \{ gql \} = require\("apollo-server(?:-express)?"\);/g, 'const gql = require("graphql-tag");'));
}
replace("API/GraphQL/Resolver/index.js", 'resolver.Upload = require("graphql-upload").GraphQLUpload;\n', "");
replace("API/app.js", 'const { ApolloServer } = require("apollo-server-express");', 'const { ApolloServer } = require("@apollo/server");\nconst { expressMiddleware } = require("@as-integrations/express4");\nconst { unwrapResolverError } = require("@apollo/server/errors");');
replace("API/app.js", 'const { graphqlUploadExpress } = require("graphql-upload");\n', "");
replace("API/app.js", 'function buildSchema() { return makeExecutableSchema({ typeDefs, resolvers }); }', 'async function buildSchema() {\n  const { default: Upload } = await import("graphql-upload/GraphQLUpload.mjs");\n  return makeExecutableSchema({ typeDefs, resolvers: { ...resolvers, Upload } });\n}');
replace("API/app.js", 'function formatError(error) {\n  const status = error.originalError?.statusCode;', 'function formatError(error, originalError = error) {\n  const status = unwrapResolverError(originalError)?.statusCode;');
replace("API/app.js", 'async function createApp() {\n  const app = express();', 'async function createApp() {\n  const { default: graphqlUploadExpress } = await import("graphql-upload/graphqlUploadExpress.mjs");\n  const app = express();');
replace("API/app.js", 'schema: buildSchema(),', 'schema: await buildSchema(),');
replace("API/app.js", '    context: async ({ req, res }) => ({ ...await requestIdentity(req), res, ip: req.ip }), formatError,', '    formatError,');
replace("API/app.js", '  server.applyMiddleware({ app, path: "/graphql", cors: false, bodyParserConfig: false });', '  app.use("/graphql", expressMiddleware(server, { context: async ({ req, res }) => ({ ...await requestIdentity(req), res, ip: req.ip }) }));');
replace("API/test/policy.test.js", 'const test = require("node:test");', 'const test = require("node:test");\nconst { before } = require("node:test");');
replace("API/test/policy.test.js", 'const schema = buildSchema();', 'let schema;\nbefore(async () => { schema = await buildSchema(); });');
const integration = "API/test/integration.test.js";
write(integration, read(integration).replace(/const schema = buildSchema\(\);/g, 'const schema = await buildSchema();'));
const workflow = ".github/workflows/security-validation.yml";
replace(workflow, 'require(\'./app\').buildSchema(); console.log(\'GraphQL schema constructed\')', 'require(\'./app\').buildSchema().then(() => console.log(\'GraphQL schema constructed\'))');
// Use a request-local Apollo client factory without the obsolete experimental Next adapter.
write("backend/src/app/ApolloWrapper.tsx", '"use client";\nimport { useState, type PropsWithChildren } from "react";\nimport { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";\nimport createUploadLink from "apollo-upload-client/createUploadLink.mjs";\nexport function ApolloWrapper({ children }: PropsWithChildren) {\n  const [client] = useState(() => new ApolloClient({\n    cache: new InMemoryCache(),\n    link: createUploadLink({ uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:2024/graphql", credentials: "include", headers: { "Apollo-Require-Preflight": "true" } }),\n  }));\n  return <ApolloProvider client={client}>{children}</ApolloProvider>;\n}\n');
// Root packages are not runtime dependencies for these independent applications.
write("package.json", JSON.stringify({ name: "highstyle", version: "1.0.0", private: true, engines: { node: ">=22.16 <25" }, scripts: { "test:api": "npm test --prefix API", "build:store": "npm run build --prefix frontend", "build:admin": "npm run build --prefix backend" } }, null, 2) + "\n");
console.log("Supported runtime migration prepared. Lockfiles must be regenerated and all acceptance gates rerun.");
