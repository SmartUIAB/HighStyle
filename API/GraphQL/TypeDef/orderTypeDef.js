const { gql } = require("apollo-server-express");

const orderTypeDefs = gql`
  type Mutation {
    AddOrder(customerId: ID!, cartId: ID!): CreateOrderResponses
  }

  type CreateOrderResponses {
    order: String
    paymentIntentClientSecret: String
  }
`;

module.exports = orderTypeDefs;
