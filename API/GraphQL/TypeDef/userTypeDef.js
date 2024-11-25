const { gql } = require("apollo-server-express");

const userTypeDefs = gql`
  scalar Upload

  type User {
    id: ID!
    email: String!
    firstname: String
    lastname: String
    company: String
    image: String
  }

  type AuthPayload {
    user: User!
    token: String!
  }

  input RegisterInput {
    email: String!
    password: String!
    firstname: String!
    lastname: String!
    company: String
  }

  type Mutation {
    register(input: RegisterInput!, image: Upload): AuthPayload!
    login(email: String!, password: String!, rememberMe: Boolean!): AuthPayload!
    logout: Boolean!
  }

  type Query {
    me: User
  }
`;

module.exports = userTypeDefs;
