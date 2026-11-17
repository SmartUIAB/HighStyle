// src/app/ApolloWrapper.tsx

"use client";

// import { HttpLink } from "@apollo/client";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/experimental-nextjs-app-support";

import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
function makeClient() {

  // const httpLink = new HttpLink({
  //   uri:
  //     process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
  //     "http://localhost:2024/graphql",
  //   // credentials: "include",
  // });

  // return new ApolloClient({
  //   cache: new InMemoryCache(),
  //   link: httpLink
  // });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: createUploadLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
        "http://localhost:2024/graphql", credentials: "include",
      headers: { "Apollo-Require-Preflight": "true" },
    }),
  });
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}