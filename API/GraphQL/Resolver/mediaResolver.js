const { upload } = require("../../Utilities/upload");
const Company = require("../../Model/companyModel");
const Media = require("../../Model/mediaModel");
const CustomError = require("../../Utilities/CustomError");
const {
  deleteImageFromStorage,
} = require("../../Utilities/miscellaneousUtils");
const { checkPermission } = require("../../Utilities/permissionMiddleware");

const mediaResolvers = {
  Query: {
    getAllImages: async (_, { page, limit }, context) => {
      try {
        const skip = (page - 1) * limit;
        const totalCount = await Media.countDocuments({ company: context.user.company });

        const images = await Media.find({ company: context.user.company }).skip(skip).limit(limit);

        return {
          images,
          totalCount,
          totalPages: Math.ceil((await Media.countDocuments({ company: context.user.company })) / limit),
          currentPage: page,
        };
      } catch (error) {
        console.error("Error fetching images:", error);
        return {
          images: [],
          totalCount: 0,
        };
      }
    },
  },
  Mutation: {
    uploadImages: checkPermission({
      module: "Media",
      name: "Manage Media",
    })(async (_, { images }, context) => {
      try {
        let company = await Company.findById(context.user.company);

        if (!images || images.length === 0) {
          throw new Error("No images provided");
        }

        const uploadedFiles = [];
        for (const uploadValue of images) {
          const resolved = await uploadValue;
          const image = resolved?.file || resolved;
          if (!image || !image.filename || !image.mimetype) {
            throw new Error("Invalid file structure");
          }

          const { filename, mimetype } = image;
          const uploadedImagePath = await upload(
            image,
            `${company.name.replace(/\s+/g, "")}/Media`
          );

          const media = await Media.create({
            fileName: filename,
            filePath: uploadedImagePath,
            fileType: mimetype,
            company: company._id,
          });

          uploadedFiles.push(media);
        }

        return {
          success: true,
          images: uploadedFiles,
        };
      } catch (error) {
        console.error("Error uploading images:", error);
        return {
          success: false,
          images: [],
        };
      }
    }),

    deleteImage: checkPermission({
      module: "Media",
      name: "Manage Media",
    })(async (_, { imageIds }) => {
      try {
        if (!imageIds || imageIds.length === 0) {
          throw new CustomError("No image IDs provided", 400);
        }

        const deletedImages = [];

        for (let imageId of imageIds) {
          const existingImage = await Media.findById(imageId);
          if (!existingImage) {
            throw new CustomError(`Image with ID ${imageId} not found`, 404);
          }

          if (existingImage.filePath) {
            await deleteImageFromStorage(existingImage.filePath);
          }

          const result = await Media.findByIdAndDelete(imageId);
          if (result) {
            deletedImages.push(imageId);
          }
        }

        return deletedImages.length === imageIds.length;
      } catch (error) {
        throw new CustomError("Failed to delete images", 500);
      }
    }),
  },
};

module.exports = mediaResolvers;
