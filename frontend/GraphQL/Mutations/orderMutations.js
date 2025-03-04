import { gql } from "@apollo/client";

export const CREATE_ORDER = gql`
  mutation AddOrder(
    $customerId: ID!
    $cartId: ID!
    $shippingAddress: ShippingAddressInput!
    $locale: String
  ) {
    AddOrder(
      customerId: $customerId
      cartId: $cartId
      shippingAddress: $shippingAddress
      locale: $locale
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
