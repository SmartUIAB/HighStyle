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
      }
      token
    }
  }
`;

export const LOGOUT_USER = gql`
  mutation Logout {
    logout
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory(
    $name: String!
    $type: ItemType!
    $description: String
    $image: Upload
  ) {
    createCategory(
      name: $name
      type: $type
      description: $description
      image: $image
    ) {
      name
      type
      image
      description
    }
  }
`;
