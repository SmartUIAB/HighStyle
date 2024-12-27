import { gql } from "@apollo/client";

export const CREATE_ORDER = gql`
  mutation AddOrder($customerId: ID!, $cartId: ID!) {
    AddOrder(customerId: $customerId, cartId: $cartId) {
      order
      paymentIntentClientSecret
    }
  }
`;
