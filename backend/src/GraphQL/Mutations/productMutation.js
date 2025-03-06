import { gql } from "@apollo/client";

export const CREATE_PHYSICAL_PRODUCT = gql`
  mutation CreatePhysicalProduct(
    $input: PhysicalProductInput
    $images: [Upload]
  ) {
    createPhysicalProduct(input: $input, images: $images) {
      id
      title
      description
      category {
        id
        name
        type
        image
        description
      }
      subcategory {
        id
        name
        image
        type
        description
      }
      SKU
      price
      discount
      stockQuantity
      metaTitle
      metaDescription
      colors
      sizes
      tags
      status
      images
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_DIGITAL_PRODUCT = gql`
  mutation CreateDigitalProduct(
    $input: DigitalProductInput
    $images: [Upload]
  ) {
    createDigitalProduct(input: $input, images: $images) {
      id
      title
      description
      category {
        id
        name
        type
        image
        description
      }
      subcategory {
        id
        name
        image
        type
        description
      }
      SKU
      price
      discount
      licenseType
      fileFormat
      fileSize
      version
      compatibility
      tags
      metaTitle
      metaDescription
      status
      images
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_PHYSICAL_PRODUCT = gql`
  mutation DeletePhysicalProduct($deletePhysicalProductId: ID!) {
    deletePhysicalProduct(id: $deletePhysicalProductId)
  }
`;

export const DELETE_DIGITAL_PRODUCT = gql`
  mutation DeleteDigitalProduct($deleteDigitalProductId: ID!) {
    deleteDigitalProduct(id: $deleteDigitalProductId)
  }
`;

export const UPDATE_PHYSICAL_PRODUCT = gql`
  mutation UpdatePhysicalProduct(
    $updatePhysicalProductId: ID!
    $images: [Upload]
    $input: UpdatePhysicalProductInput
    $deleteImages: [String]
  ) {
    updatePhysicalProduct(
      id: $updatePhysicalProductId
      images: $images
      input: $input
      deleteImages: $deleteImages
    ) {
      id
      title
      description
      category {
        id
        name
        type
        image
        description
      }
      subcategory {
        id
        name
        image
        type
        description
      }
      SKU
      price
      discount
      stockQuantity
      metaTitle
      metaDescription
      colors
      sizes
      tags
      status
      images
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_DIGITAL_PRODUCT = gql`
  mutation UpdateDigitalProduct(
    $updateDigitalProductId: ID!
    $input: UpdateDigitalProductInput
    $images: [Upload]
    $deleteImages: [String]
  ) {
    updateDigitalProduct(
      id: $updateDigitalProductId
      input: $input
      images: $images
      deleteImages: $deleteImages
    ) {
      id
      title
      description
      category {
        id
        name
        type
        image
        description
      }
      subcategory {
        id
        name
        image
        type
        description
      }
      SKU
      price
      discount
      licenseType
      fileFormat
      fileSize
      version
      compatibility
      tags
      metaTitle
      metaDescription
      status
      images
      createdAt
      updatedAt
    }
  }
`;
