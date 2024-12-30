import { gql } from "@apollo/client";

export const GET_TRANSACTION = gql`
  query GetAllTransactions {
    getAllTransactions {
      totalCount
      totalPages
      currentPage
      transactions {
        id
        order {
          id
          user {
            id
            email
            firstname
            lastname
          }
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
        transactionAmount
        transactionStatus
        paymentGateway
        transactionId
        createdAt
      }
    }
  }
`;

export const GET_ORDER_LIST = gql`
  query GetAllOrders {
    getAllOrders {
      totalCount
      totalPages
      currentPage
      orders {
        id
        user {
          id
          email
          firstname
          lastname
          image
        }
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
  }
`;
