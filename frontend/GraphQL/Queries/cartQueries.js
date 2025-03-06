import { gql } from "@apollo/client";

export const GET_CART = gql`
  query GetCart($userId: ID!) {
    getCart(userId: $userId) {
      id
      userId
      products {
        ProductID
        price
        quantity
        color
        size
        totalAmount
        image
        title
        _id
      }
      totalAmount
      createdAt
      updatedAt
    }
  }
`;
