const { gql } = require("apollo-server-express");

const userTypeDefs = gql`
  type User {
    id: ID!
    email: String!
  }

  type AuthPayload {
    user: User!
    token: String!
  }

  input RegisterInput {
    email: String!
    password: String!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(email: String!, password: String!, rememberMe: Boolean!): AuthPayload!
    logout: Boolean!
  }

  type Query {
    me: User
  }
`;

module.exports = userTypeDefs;
