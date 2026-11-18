const gql = require("graphql-tag");

const vendorTypeDefs = gql`
  scalar Upload

  enum BusinessType {
    Physical
    Digital
  }

  type Query {
    vendorById(vendorId: ID!): VendorResponse

    vendors(page: Int, limit: Int): VendorsPage
  }

  type Mutation {
    createVendor(
      input: VendorInput!
      logo: Upload
      password: String!
      permissions: [String]!
    ): VendorResponse!
    updateVendor(
      id: ID!
      input: UpdateVendorInput
      logo: Upload
      password: String
      permissions: [String]
    ): VendorResponse!
    deleteVendor(id: ID!): DeleteVendorResponse!
  }

  type VendorResponse {
    id: ID!
    name: String!
    email: String!
    businessType: BusinessType!
    contactNumber: String!
    address: String!
    company: ID!
    logo: String
    status: String!
    permissions: [String]!
  }

  input VendorInput {
    name: String!
    email: String!
    businessType: BusinessType!
    contactNumber: String!
    address: String!
  }

  input UpdateVendorInput {
    name: String
    email: String
    businessType: BusinessType
    contactNumber: String
    address: String
  }

  type DeleteVendorResponse {
    message: String!
    success: Boolean!
  }

  type VendorsPage {
    vendors: [VendorResponse]!
    totalCount: Int!
    totalPages: Int!
    currentPage: Int!
    perPage: Int!
  }
`;

module.exports = vendorTypeDefs;
