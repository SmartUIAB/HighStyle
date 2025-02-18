const { gql } = require("apollo-server-express");

const userTypeDefs = gql`
  scalar Upload

  type userPermission {
    id: ID
    module: String
    name: String
    description: String
  }

  type Company {
    id: ID!
    name: String!
  }

  type User {
    id: ID!
    email: String!
    firstname: String
    lastname: String
    company: String
    image: String
    role: String
    permissions: [userPermission!]
  }

  type LoginUser {
    id: ID!
    email: String!
    firstname: String
    lastname: String
    company: Company!
    image: String
    role: String
    permissions: [userPermission!]
  }

  type AuthPayload {
    user: User!
    token: String!
  }

  type LoginAuthPayload {
    user: LoginUser!
    token: String!
  }

  type OutputUser {
    id: ID!
    email: String!
    firstname: String!
    lastname: String!
    company: String
    password: String
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

  input UpdateMeInput {
    email: String
    firstname: String
    lastname: String
    company: String
    image: String
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
    login(
      email: String!
      password: String!
      rememberMe: Boolean!
    ): LoginAuthPayload!
    logout: Boolean!
    createUser(input: UserInput!, image: Upload): OutputUser!
    updateUser(userId: ID!, input: UpdateUserInput, image: String): OutputUser!
    updateMe(input: UpdateMeInput!, image: Upload): User!
    deleteUser(userId: ID!): DeleteUserResponse!
  }

  type Query {
    me: User
    userlist: [OutputUser!]!
    userById(userId: ID!): OutputUser!
    users(page: Int, limit: Int): PaginatedUserList!
  }
`;

module.exports = userTypeDefs;
