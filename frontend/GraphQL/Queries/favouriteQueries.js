import { gql } from "@apollo/client";

export const GET_FAVOURITE_PRODUCT = gql`
  query GetFavourites($userId: ID!) {
    getFavourites(userId: $userId) {
      _id
      userId
      productId {
        _id
        title
        price
        images
        status
        colors
        sizes
      }
      productType
      createdAt
      updatedAt
    }
  }
`;
