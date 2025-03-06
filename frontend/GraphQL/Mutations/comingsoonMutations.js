import { gql } from "@apollo/client";

export const NOTIFY_ME = gql`
  mutation NotifyMe($email: String!) {
    notifyMe(email: $email)
  }
`;
