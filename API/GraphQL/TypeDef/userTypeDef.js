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
    role: String
    permissions: [ID!]!
  }

  type DeleteUserResponse {
    success: Boolean!
    message: String!
  }

  type PaginatedUserList {
    users: [OutputUser]
    totalCount: Int!
    totalPages: Int!
    currentPage: Int!
  }

  input UserInput {
    email: String!
    password: String!
    firstname: String!
    lastname: String!
    permissions: [ID!]!
  }

  input UpdateUserInput {
    email: String
    password: String
    firstname: String
    lastname: String
    permissions: [ID!]
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
    updateUser(userId: ID!, input: UpdateUserInput, image: String): OutputUser!
    deleteUser(userId: ID!): DeleteUserResponse!
  }

  type Query {
    me: Users
    userlist: [OutputUser!]!
    userById(userId: ID!): OutputUser!
    users(page: Int, limit: Int): PaginatedUserList!
  }
`;

module.exports = userTypeDefs;
