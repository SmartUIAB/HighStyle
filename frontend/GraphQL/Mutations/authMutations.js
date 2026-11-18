import { gql } from "@apollo/client";

export const REGISTER_USER = gql`
  mutation CreateCustomer($input: CustomerInput!, $password: String!) {
    createCustomer(input: $input, password: $password) {
      id
      firstname
      lastname
      email
    }
  }
`;

export const LOGIN_USER = gql`
  mutation LoginCustomer($email: String!, $password: String!) {
    loginCustomer(email: $email, password: $password) {
      customer {
        id
        email
        firstname
        lastname
      }
    }
  }
`;

export const LOGOUT_USER = gql`
  mutation Logout {
    logout
  }
`;

export const FORGET_PASSWORD = gql`
  mutation ForgetPassword($email: String!) {
    forgetPassword(email: $email) {
      message
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ForgetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword) {
      message
    }
  }
`;
