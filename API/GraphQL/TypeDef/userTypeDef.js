const { gql } = require("apollo-server-express");

const userTypeDefs = gql`
  scalar Upload

  type Users {
    id: ID!
    email: String!
    firstname: String
    lastname: String
    company: String
    image: String
  }

  type User {
    id: ID!
    email: String!
    firstname: String
    lastname: String
    company: String
    image: String
    permissions: [UserPer!]!
  }

  type AuthPayload {
    user: Users!
    token: String!
  }

  type UserPer {
    id: ID!
  }

  type OutputUser {
    id: ID!
    email: String!
    firstname: String!
    lastname: String!
    company: String
    image: String
    permissions: [ID!]!
  }

  input UserInput {
    email: String!
    password: String!
    firstname: String!
    lastname: String!
    permissions: [ID!]!
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
    createUser(input: UserInput!, image: Upload): OutputUser!
  }

  type Query {
    me: Users
    userlist: [OutputUser!]!
    user(id: ID!): User
  }
`;

module.exports = userTypeDefs;
