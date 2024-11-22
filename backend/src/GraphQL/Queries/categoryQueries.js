import { gql } from "@apollo/client";

export const GET_CATEGORY = gql`
  query Categories($pagination: PaginationInput) {
    categories(pagination: $pagination) {
      categories {
        description
        id
        image
        name
        type
      }
    }
  }
`;
