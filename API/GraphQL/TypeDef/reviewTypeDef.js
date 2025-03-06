const { gql } = require("apollo-server-express");

const reviewTypeDef = gql`
  type Customer {
    id: ID!
    firstname: String!
    lastname: String!
    email: String!
  }

  type Review {
    id: ID!
    productId: ID!
    userId: Customer!
    rating: Int!
    comment: String!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    getReviews(productId: ID!): [Review!]!
  }

  type Mutation {
    writeReview(
      productId: ID!
      userId: ID!
      rating: Int!
      comment: String!
    ): Response
    updateReview(
      productId: ID!
      userId: ID!
      rating: Int
      comment: String
    ): Response
  }

  type Response {
    message: String!
  }
`;

module.exports = reviewTypeDef;
