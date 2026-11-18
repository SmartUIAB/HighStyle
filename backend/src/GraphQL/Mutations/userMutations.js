import { gql } from "@apollo/client";

export const CREATE_USER = gql`
  mutation Mutation($input: UserInput!) {
    createUser(input: $input) {
      id
      email
      firstname
      lastname
      company
      image
      role
      permissions
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($userId: ID!) {
    deleteUser(userId: $userId) {
      success
      message
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($userId: ID!, $input: UpdateUserInput) {
    updateUser(userId: $userId, input: $input) {
      id
      email
      firstname
      lastname
      company
      image
      role
      permissions
    }
  }
`;
