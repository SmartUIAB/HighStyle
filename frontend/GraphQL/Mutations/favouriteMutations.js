import { gql } from "@apollo/client";

export const REMOVE_FAVOURITE = gql`
  mutation RemoveFromFavourite(
    $userId: ID!
    $productId: ID!
    $productType: FavouriteItemType!
  ) {
    removeFromFavourite(
      userId: $userId
      productId: $productId
      productType: $productType
    )
  }
`;

export const ADD_TO_FAVOURITE = gql`
  mutation AddToFavourite(
    $userId: ID!
    $productId: ID!
    $productType: FavouriteItemType!
  ) {
    addToFavourite(
      userId: $userId
      productId: $productId
      productType: $productType
    ) {
      _id
      userId
      productId {
        _id
        title
        price
        images
        colors
        sizes
        status
      }
      productType
      createdAt
      updatedAt
    }
  }
`;