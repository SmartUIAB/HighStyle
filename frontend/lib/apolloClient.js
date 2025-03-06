// lib/apolloClient.js
import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri:
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:2024/graphql",
  credentials: "include",
  cache: new InMemoryCache(),
});

export default client;
