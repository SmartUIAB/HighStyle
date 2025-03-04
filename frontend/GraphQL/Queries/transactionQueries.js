import { gql } from "@apollo/client";

export const GET_ALL_TRANSACTIONS = gql`
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
            company
            image
            role
            permissions {
              id
              module
              name
              description
            }
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
