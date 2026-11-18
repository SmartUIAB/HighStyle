import { gql } from "@apollo/client";

export const GET_REVIEWS = gql`
  query GetReviews($productId: ID!) {
    getReviews(productId: $productId) {
      id
      productId
      userId {
        id
        firstname
        lastname
      }
      rating
      comment
      createdAt
      updatedAt
    }
  }
`;
