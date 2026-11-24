const gql = require("graphql-tag");

const reviewTypeDef = gql`
  type Reviewer {
    id: ID!
    firstname: String!
    lastname: String!
  }

  type Review {
    id: ID!
    productId: ID!
    userId: Reviewer!
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
