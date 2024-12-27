import { gql } from "@apollo/client";

export const CREATE_ADD_TO_CART = gql`
  mutation CreateCart($input: CartInput!) {
    createCart(input: $input) {
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
      }
      totalAmount
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_CART_ITEM = gql`
  mutation DeleteCart($cartId: ID!, $productId: ID!) {
    deleteCart(cartId: $cartId, productId: $productId) {
      id
      userId
      products {
        ProductID
        price
        quantity
        color
        size
        totalAmount
        title
        image
      }
      totalAmount
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_CART_ITEM = gql`
  mutation UpdateCart($cartId: ID!, $productId: ID!, $newQuantity: Int!) {
    updateCart(
      cartId: $cartId
      productId: $productId
      newQuantity: $newQuantity
    ) {
      id
      userId
      products {
        ProductID
        price
        quantity
        color
        size
        totalAmount
        title
        image
        _id
      }
      totalAmount
      createdAt
      updatedAt
    }
  }
`;
