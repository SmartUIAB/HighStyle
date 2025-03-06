import { gql } from "@apollo/client";

export const WRITE_REVIEW = gql`
  mutation WriteReview(
    $productId: ID!
    $userId: ID!
    $rating: Int!
    $comment: String!
  ) {
    writeReview(
      productId: $productId
      userId: $userId
      rating: $rating
      comment: $comment
    ) {
      message
    }
  }
`;

export const UPDATE_REVIEW = gql`
  mutation WriteReview(
    $productId: ID!
    $userId: ID!
    $rating: Int
    $comment: String
  ) {
    updateReview(
      productId: $productId
      userId: $userId
      rating: $rating
      comment: $comment
    ) {
      message
    }
  }
`;
