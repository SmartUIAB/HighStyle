const gql = require("graphql-tag");

const cartTypeDefs = gql`
  type Cart {
    id: ID!
    userId: ID!
    products: [ProductInCart!]!
    totalAmount: Float!
    createdAt: String!
    updatedAt: String!
  }

  type ProductInCart {
    ProductID: ID!
    price: Float!
    quantity: Int!
    color: String
    size: String
    totalAmount: Float!
    title: String!
    image: String
    _id: ID!
  }

  input ProductInput {
    ProductID: ID!
    price: Float!
    quantity: Int!
    color: String
    size: String
    totalAmount: Float!
    title: String!
  }

  input CartInput {
    userId: ID!
    products: [ProductInput!]!
    totalAmount: Float
  }

  type Query {
    getCart(userId: ID!): Cart
    getCarts: [Cart!]!
  }

  type Mutation {
    createCart(input: CartInput!): Cart
    updateCart(cartId: ID!, productId: ID!, newQuantity: Int!): Cart
    deleteCart(cartId: ID!, productId: ID!): Cart
  }
`;

module.exports = cartTypeDefs;
