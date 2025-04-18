import { gql } from "@apollo/client";

export const CREATE_VENDOR = gql`
  mutation CreateVendor(
    $input: VendorInput!
    $password: String!
    $permissions: [String]!
  ) {
    createVendor(
      input: $input
      password: $password
      permissions: $permissions
    ) {
      id
      name
      email
      businessType
      contactNumber
      address
      company
      logo
      status
      permissions
    }
  }
`;

export const DELETE_VENDOR = gql`
  mutation DeleteVendor($deleteVendorId: ID!) {
    deleteVendor(id: $deleteVendorId) {
      message
      success
    }
  }
`;

export const UPDATE_VENDOR = gql`
  mutation UpdateVendor(
    $updateVendorId: ID!
    $input: UpdateVendorInput
    $password: String
    $permissions: [String]
  ) {
    updateVendor(
      id: $updateVendorId
      input: $input
      password: $password
      permissions: $permissions
    ) {
      id
      name
      email
      businessType
      contactNumber
      address
      company
      logo
      status
      permissions
    }
  }
`;