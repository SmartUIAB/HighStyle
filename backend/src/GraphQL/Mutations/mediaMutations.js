import { gql } from "@apollo/client";

export const DELETE_MEDIA = gql`
  mutation DeleteImage($imageIds: [ID!]) {
    deleteImage(imageIds: $imageIds)
  }
`;

export const UPLOAD_MEDIA = gql`
  mutation UploadImages($images: [Upload!]) {
    uploadImages(images: $images) {
      success
      images {
        id
        fileName
        filePath
        fileType
      }
    }
  }
`;
