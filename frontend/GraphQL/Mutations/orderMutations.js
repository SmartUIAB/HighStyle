import { gql } from "@apollo/client";

export const CREATE_ORDER = gql`
  mutation AddOrder(
    $customerId: ID!
    $cartId: ID!
    $shippingAddress: ShippingAddressInput!
  ) {
    AddOrder(
      customerId: $customerId
      cartId: $cartId
      shippingAddress: $shippingAddress
    ) {
      order
      paymentIntentClientSecret
    }
  }
`;
