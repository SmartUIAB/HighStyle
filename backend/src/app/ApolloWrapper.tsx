"use client";
import { useState, type PropsWithChildren } from "react";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
export function ApolloWrapper({ children }: PropsWithChildren) {
  const [client] = useState(() => new ApolloClient({
    cache: new InMemoryCache(),
    link: createUploadLink({ uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:2024/graphql", credentials: "include", headers: { "Apollo-Require-Preflight": "true" } }),
  }));
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
