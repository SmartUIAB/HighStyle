import { gql } from "@apollo/client";

export const REGISTER_USER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
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

export const LOGIN_USER = gql`
  mutation Login($email: String!, $rememberMe: Boolean!, $password: String!) {
    login(email: $email, rememberMe: $rememberMe, password: $password) {
      token
      user {
        id
        email
        firstname
        lastname
        company {
          id
          name
        }
        image
        role
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
