import { gql } from "@apollo/client";

export const GET_MY_ORDERS = gql`
  query GetMyOrder($customerId: ID!) {
    GetMyOrder(customerId: $customerId) {
      id
      products {
        productType
        productId
        quantity
      }
      finalTotal
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