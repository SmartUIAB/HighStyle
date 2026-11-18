const gql = require("graphql-tag");

const orderTypeDefs = gql`
  type Mutation {
    AddOrder(
      customerId: ID!
      cartId: ID!
      shippingAddress: ShippingAddressInput!
      locale: String
    ): CreateOrderResponses
    cancelCheckout(orderId: ID!): Order
    deleteOldPendingOrders: Int
  }

  type Query {
    GetMyOrder(customerId: ID!): [Order]
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
