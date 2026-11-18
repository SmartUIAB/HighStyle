import { gql } from "@apollo/client";

export const GET_PHYSICAL_PRODUCT = gql`
  query PhysicalProducts {
    physicalProducts {
      products {
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
        availableQuantity
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
      currentPage
      totalPages
      total
    }
  }
`;

export const GET_DIGITAL_PRODUCT = gql`
  query Query {
    digitalProducts {
      products {
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
      currentPage
      totalPages
      total
    }
  }
`;

export const PHYSICAL_PRODUCT_BY_ID = gql`
  query PhysicalProduct($physicalProductId: ID!) {
    physicalProduct(id: $physicalProductId) {
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
      availableQuantity
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

export const DIGITAL_PRODUCT_BY_ID = gql`
  query DigitalProduct($digitalProductId: ID!) {
    digitalProduct(id: $digitalProductId) {
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
