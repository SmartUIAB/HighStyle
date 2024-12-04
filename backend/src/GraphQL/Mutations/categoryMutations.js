import { gql } from "@apollo/client";

export const CREATE_CATEGORY = gql`
  mutation CreateCategory(
    $name: String!
    $type: ItemType!
    $description: String
    $image: Upload
  ) {
    createCategory(
      name: $name
      type: $type
      description: $description
      image: $image
    ) {
      id
      name
      type
      image
      description
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($deleteCategoryId: ID!) {
    deleteCategory(id: $deleteCategoryId)
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory(
    $updateCategoryId: ID!
    $name: String
    $type: ItemType
    $description: String
    $image: Upload
  ) {
    updateCategory(
      id: $updateCategoryId
      name: $name
      type: $type
      description: $description
      image: $image
    ) {
      id
      name
      type
      image
      description
    }
  }
`;

export const CREATE_SUB_CATEGORY = gql`
  mutation CreateCategory(
    $name: String!
    $categoryId: ID!
    $description: String
    $image: Upload
    $type: ItemType
  ) {
    createSubcategory(
      name: $name
      categoryId: $categoryId
      description: $description
      image: $image
      type: $type
    ) {
      id
      name
      image
      description
      type
    }
  }
`;
