import { gql } from "@apollo/client";

export const GET_MEDIA_LIST = gql`
  query GetAllImages($page: Int!, $limit: Int!) {
    getAllImages(page: $page, limit: $limit) {
      images {
        id
        fileName
        filePath
        fileType
      }
      totalCount
      currentPage
      totalPages
    }
  }
`;
