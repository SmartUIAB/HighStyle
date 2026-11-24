import { gql } from "@apollo/client";

export const GET_ALL_PERMISSIONS = gql`
  query Permissions {
    permissions {
      id
      name
      description
      module
    }
  }
`;

export const USER_LIST = gql`
  query Query {
    userlist {
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

export const USER_BY_ID = gql`
  query UserById($userId: ID!) {
    userById(userId: $userId) {
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

export const GET_USER = gql`
  query Me {
    me {
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
  }
`;
