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

export const ORDER_SEND_EMAIL = gql`
  mutation SendOrderEmail($userEmail: String!) {
    sendOrderEmail(userEmail: $userEmail)
  }
`;
