import { gql } from "@apollo/client";

export const GET_ALL_NOTIFICATION = gql`
  query GetAllNotification {
    getAllNotification {
      id
      message
      isNotified
      createdAt
    }
  }
`;
