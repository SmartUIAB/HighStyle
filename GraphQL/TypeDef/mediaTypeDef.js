const { gql } = require("apollo-server-express");

const mediaTypeDef = gql`
  scalar Upload

  type Media {
    id: ID!
    fileName: String!
    filePath: String!
    fileType: String!
  }

  type UploadResponse {
    success: Boolean!
    images: [Media]!
  }

  type PaginatedImages {
    images: [Media]!
    totalCount: Int!
    currentPage: Int!
    totalPages: Int!
  }

  type Query {
    getAllImages(page: Int!, limit: Int!): PaginatedImages!
  }

  type Mutation {
    uploadImages(images: [Upload!]): UploadResponse!
    deleteImage(imageIds: [ID!]): Boolean!
  }
`;

module.exports = mediaTypeDef;
