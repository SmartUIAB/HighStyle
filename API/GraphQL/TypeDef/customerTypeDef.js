const { gql } = require("apollo-server-express");

const customerTypeDef = gql`
  input CustomerInput {
    firstname: String!
    lastname: String!
    email: String!
  }

  type CustomerResponse {
    id: ID!
    firstname: String!
    lastname: String!
    email: String!
  }

  type Customer {
    id: ID!
    email: String!
    firstname: String
    lastname: String
  }

  type CustomerAuthPayload {
    customer: Customer!
    token: String!
  }

  type MessageResponse {
    message: String!
  }

  type Mutation {
    loginCustomer(email: String!, password: String!): CustomerAuthPayload!
    createCustomer(input: CustomerInput!, password: String!): CustomerResponse!
    forgetPassword(email: String!): MessageResponse
    resetPassword(token: String!, newPassword: String!): MessageResponse
  }
`;

module.exports = customerTypeDef;
