import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

// Fail closed in production when the required deployment endpoint is absent.
const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
  (process.env.NODE_ENV === "development" ? "http://localhost:2024/graphql" : "/api/graphql-not-configured");

const client = new ApolloClient({
  link: new HttpLink({ uri: endpoint, credentials: "include" }),
  cache: new InMemoryCache(),
});

export default client;
