import { gql } from "@apollo/client";

export const REGISTER_USER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      user {
        id
        email
      }
      token
    }
  }
`;

export const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!, $rememberMe: Boolean!) {
    login(email: $email, password: $password, rememberMe: $rememberMe) {
      user {
        id
        email
        firstname
        lastname
        company
        image
        permissions {
          id
          module
          name
          description
        }
      }
    }
  }
`;

export const LOGOUT_USER = gql`
  mutation Logout {
    logout
  }
`;
