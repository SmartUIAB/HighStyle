import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

// Fail closed in production when the required deployment endpoint is absent.
const endpoint = typeof window === "undefined"
  ? (process.env.API_ORIGIN ? `${process.env.API_ORIGIN}/graphql` : "http://127.0.0.1:2024/graphql")
  : (process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "/api/graphql");

const client = new ApolloClient({
  link: new HttpLink({ uri: endpoint, credentials: "include" }),
  cache: new InMemoryCache(),
});

export default client;
