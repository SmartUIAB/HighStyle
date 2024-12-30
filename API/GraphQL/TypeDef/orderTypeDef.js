const { gql } = require("apollo-server-express");

const orderTypeDefs = gql`
  type Mutation {
    AddOrder(
      customerId: ID!
      cartId: ID!
      shippingAddress: ShippingAddressInput!
    ): CreateOrderResponses
  }

  type CreateOrderResponses {
    order: String
    paymentIntentClientSecret: String
  }

  input ShippingAddressInput {
    street: String!
    city: String!
    state: String!
    postalCode: String!
    country: String!
  }
`;

module.exports = orderTypeDefs;
