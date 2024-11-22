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
      name
      type
      image
      description
    }
  }
`;
