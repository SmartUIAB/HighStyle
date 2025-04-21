import { gql } from "@apollo/client";

export const GET_CATEGORY_LIST = gql`
  query Categories {
    categories {
      categories {
        id
        name
        type
        image
        description
        subcategories {
          id
          name
          image
          type
          description
        }
      }
      currentPage
      totalPages
      total
    }
  }
`;
