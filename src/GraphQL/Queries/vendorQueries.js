import { gql } from "@apollo/client";

export const VENDOR_LIST = gql`
  query Query {
    vendors {
      vendors {
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
      totalCount
      totalPages
      currentPage
      perPage
    }
  }
`;

export const VENDOR_BY_ID = gql`
  query VendorById($vendorId: ID!) {
    vendorById(vendorId: $vendorId) {
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
