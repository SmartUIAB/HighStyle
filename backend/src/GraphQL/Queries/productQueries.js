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
