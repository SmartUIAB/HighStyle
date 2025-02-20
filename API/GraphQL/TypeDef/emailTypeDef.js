const { gql } = require("apollo-server-express");

const emailTypeDef = gql`
  input InvoiceUserInput {
    email: String!
    firstname: String!
    lastname: String!
  }

  enum ProductType {
    PHYSICAL
    DIGITAL
  }

  input OrderProductInput {
    productType: ProductType!
    productId: ID!
    quantity: Int!
  }

  input ShippingAddressInput {
    street: String!
    city: String!
    state: String!
    postalCode: String!
    country: String!
  }

  input InvoiceInput {
    id: ID!
    user: InvoiceUserInput!
    products: [OrderProductInput!]!
    finalTotal: Float!
    paymentStatus: String!
    orderStatus: String!
    shippingAddress: ShippingAddressInput!
    createdAt: String!
    updatedAt: String!
  }

  type Mutation {
    sendInvoiceEmail(invoice: InvoiceInput!, pdfBase64: String!): Boolean
  }
`;

module.exports = emailTypeDef;
