import { gql } from "@apollo/client";

export const GET_CATEGORY = gql`
  query Categories($pagination: PaginationInput) {
    categories(pagination: $pagination) {
      categories {
        id
        name
        type
        image
        description
      }
      currentPage
      totalPages
      total
    }
  }
`;

export const GET_ALL_CATEGORY = gql`
  query Categorieslist {
    categorieslist {
      id
      name
      type
      image
      description
    }
  }
`;

export const SUB_CATEGORY_ID = gql`
  query Subcategory($subcategoryId: ID!) {
    subcategory(id: $subcategoryId) {
      id
      name
      image
      type
      description
      category {
        id
        name
        type
        image
        description
      }
    }
  }
`;

export const GET_SUB_CATEGORY = gql`
  query Subcategories($pagination: PaginationInput) {
    subcategories(pagination: $pagination) {
      subcategories {
        id
        name
        image
        description
        type
      }
      currentPage
      totalPages
      total
    }
  }
`;
