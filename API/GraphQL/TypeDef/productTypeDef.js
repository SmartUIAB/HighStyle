const { gql } = require("apollo-server-express");

const productTypeDef = gql`
  scalar Upload

  enum ProductStatus {
    Available
    Unavailable
  }

  type Category {
    id: ID!
    name: String!
    type: ItemType!
    image: String
    description: String!
  }

  type Subcategory {
    id: ID!
    name: String!
    image: String
    description: String!
  }

  type PhysicalProduct {
    id: ID!
    title: String!
    description: String
    category: Category
    subcategory: Subcategory
    SKU: String!
    price: Float!
    discount: Float
    stockQuantity: Int!
    metaTitle: String
    metaDescription: String
    colors: [String]
    sizes: [String]
    tags: [String]
    status: ProductStatus!
    images: [String]
    createdAt: String
    updatedAt: String
  }

  type PhysicalProductPagination {
    products: [PhysicalProduct]
    currentPage: Int!
    totalPages: Int!
    total: Int!
  }

  enum LicenseType {
    single_use
    multi_use
    lifetime
  }

  input PhysicalProductInput {
    title: String!
    description: String!
    category: ID!
    subcategory: ID!
    SKU: String!
    price: Float!
    discount: Float!
    stockQuantity: Int!
    metaTitle: String!
    metaDescription: String!
    colors: [String]!
    sizes: [String]!
    tags: [String]!
    status: ProductStatus!
  }

  input UpdatePhysicalProductInput {
    title: String
    description: String
    SKU: String
    price: Float
    discount: Float
    stockQuantity: Int
    metaTitle: String
    metaDescription: String
    colors: [String]
    sizes: [String]
    tags: [String]
    status: ProductStatus
  }

  input PaginationInput {
    page: Int
    limit: Int
  }

  type DigitalProduct {
    id: ID!
    title: String!
    description: String
    category: Category
    subcategory: Subcategory
    SKU: String!
    price: Float!
    discount: Float
    licenseType: LicenseType!
    fileFormat: String!
    fileSize: String!
    version: String
    compatibility: [String]
    tags: [String]
    metaTitle: String
    metaDescription: String
    status: ProductStatus!
    images: [String]
    createdAt: String
    updatedAt: String
  }

  type DigitalProductPagination {
    products: [DigitalProduct]
    currentPage: Int!
    totalPages: Int!
    total: Int!
  }

  input DigitalProductInput {
    title: String!
    description: String
    category: ID!
    subcategory: ID!
    SKU: String!
    price: Float!
    discount: Float
    licenseType: LicenseType!
    fileFormat: String!
    fileSize: String!
    version: String
    compatibility: [String]
    tags: [String]!
    metaTitle: String!
    metaDescription: String!
    status: ProductStatus!
  }

  input UpdateDigitalProductInput {
    title: String
    description: String
    SKU: String
    price: Float
    discount: Float
    licenseType: LicenseType
    fileFormat: String
    fileSize: String
    version: String
    compatibility: [String]
    tags: [String]
    metaTitle: String
    metaDescription: String
    status: ProductStatus
  }

  type Query {
    physicalProduct(id: ID!): PhysicalProduct
    physicalProducts(pagination: PaginationInput): PhysicalProductPagination
    digitalProduct(id: ID!): DigitalProduct
    digitalProducts(pagination: PaginationInput): DigitalProductPagination
  }

  type Mutation {
    createPhysicalProduct(
      input: PhysicalProductInput
      images: [Upload]
    ): PhysicalProduct
    updatePhysicalProduct(
      id: ID!
      input: UpdatePhysicalProductInput
      images: [Upload]
      deleteImages: [String]
    ): PhysicalProduct
    deletePhysicalProduct(id: ID!): Boolean

    createDigitalProduct(
      input: DigitalProductInput
      images: [Upload]
    ): DigitalProduct
    updateDigitalProduct(
      id: ID!
      input: UpdateDigitalProductInput
      images: [Upload]
      deleteImages: [String]
    ): DigitalProduct
    deleteDigitalProduct(id: ID!): Boolean
  }
`;

module.exports = productTypeDef;
