import { gql } from "@apollo/client";

export const GET_MY_ORDERS = gql`
  query GetMyOrder($customerId: ID!, $orderId: ID) {
    GetMyOrder(customerId: $customerId, orderId: $orderId) {
      id
      products {
        productType
        productId
        quantity
        title
        unitAmountMinor
        totalAmountMinor
        color
        size
      }
      finalTotal
      currency
      inventoryStatus
      paymentStatus
      orderStatus
      shippingAddress {
        street
        city
        state
        postalCode
        country
      }
      createdAt
      updatedAt
    }
  }
`;
