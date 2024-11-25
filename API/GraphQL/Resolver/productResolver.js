const PhysicalProduct = require("../../Model/physicalProductModel");
const DigitalProduct = require("../../Model/digitalProductModel");
const Subcategory = require("../../Model/subCategoryModel");
const { upload } = require("../../Utilities/upload");
const CustomError = require("../../Utilities/CustomError");
const {
  deleteImageFromStorage,
} = require("../../Utilities/miscellaneousUtils");

const productResolvers = {
  Query: {
    physicalProducts: async (_, { pagination }) => {
      const { page = 1, limit = 10 } = pagination || {};
      try {
        const products = await PhysicalProduct.find()
          .skip((page - 1) * limit)
          .limit(limit);
        return {
          products,
          totalPages: Math.ceil(
            (await PhysicalProduct.countDocuments()) / limit
          ),
          currentPage: page,
          total: await PhysicalProduct.countDocuments(),
        };
      } catch (error) {
        console.log(error);
        throw new CustomError(error.message, 500);
      }
    },
    physicalProduct: async (_, { id }) => {
      try {
        return await PhysicalProduct.findById(id);
      } catch (error) {
        throw new CustomError("Physical product not found", 404);
      }
    },
    digitalProducts: async (_, { pagination }) => {
      const { page = 1, limit = 10 } = pagination || {};
      try {
        const products = await DigitalProduct.find()
          .skip((page - 1) * limit)
          .limit(limit);
        return {
          products,
          totalPages: Math.ceil(
            (await DigitalProduct.countDocuments()) / limit
          ),
          currentPage: page,
          total: await DigitalProduct.countDocuments(),
        };
      } catch (error) {
        throw new CustomError("Failed to fetch digital products", 500);
      }
    },
    digitalProduct: async (_, { id }) => {
      try {
        return await DigitalProduct.findById(id);
      } catch (error) {
        throw new CustomError("Digital product not found", 404);
      }
    },
  },

  Mutation: {
    createPhysicalProduct: async (_, { input, images }) => {
      try {
        const subcategory = await Subcategory.findById(
          input.subcategory
        ).populate("category_id");

        const product = new PhysicalProduct(input);
        if (images && images.length > 0) {
          if (images.length > 5) {
            throw new CustomError("You can only upload up to 5 images.", 400);
          }

          const imagePaths = [];
          for (let image of images) {
            const uploadedImagePath = await upload(image, `physicalProducts/`);
            imagePaths.push(uploadedImagePath);
          }

          product.images = imagePaths;
        }
        return await product.save();
      } catch (error) {
        throw new CustomError(error.message, 500);
      }
    },

    updatePhysicalProduct: async (
      _,
      { id, input, images = [], deleteImages = [] }
    ) => {
      try {
        const product = await PhysicalProduct.findById(id).populate("category");
        if (!product) throw new CustomError("Product not found", 404);

        const subcategory = await Subcategory.findById(
          product.subcategory
        ).populate("category_id");

        const existingImages = product.images;

        const remainingImages = existingImages.filter(
          (image) => !deleteImages.includes(image)
        );

        const totalImagesCount = remainingImages.length + images.length;
        if (totalImagesCount > 5) {
          throw new CustomError(
            "You can only have up to 5 images per product.",
            400
          );
        }

        if (deleteImages.length > 0) {
          await Promise.all(
            deleteImages.map((imageUrl) => deleteImageFromStorage(imageUrl))
          );
        }

        let uploadedImages = [];
        if (images && images.length > 0) {
          uploadedImages = await Promise.all(
            images.map((image) => upload(image, `physicalProducts/`))
          );
        }

        product.images = [...remainingImages, ...uploadedImages];

        Object.assign(product, input);

        await product.save();

        return product;
      } catch (error) {
        console.log(error);

        throw new CustomError(error.message, 500);
      }
    },

    deletePhysicalProduct: async (_, { id }) => {
      try {
        const product = await PhysicalProduct.findById(id);
        if (!product) throw new CustomError("Product not found", 404);

        if (product.images && product.images.length > 0) {
          await Promise.all(
            product.images.map((imageUrl) => deleteImageFromStorage(imageUrl))
          );
        }

        const result = await PhysicalProduct.findByIdAndDelete(id);

        return !!result;
      } catch (error) {
        console.log(error);
        throw new CustomError(error.message, 500);
      }
    },

    /* ----------- Digital product mutations with image upload support ---------- */
    createDigitalProduct: async (_, { input, images }) => {
      try {
        const product = new DigitalProduct(input);

        if (images && images.length > 0) {
          if (images.length > 5) {
            throw new CustomError("You can only upload up to 5 images.", 400);
          }

          const imagePaths = [];
          for (let image of images) {
            const uploadedImagePath = await upload(image, "digitalProducts");
            imagePaths.push(uploadedImagePath);
          }

          product.images = imagePaths;
        }

        return await product.save();
      } catch (error) {
        console.log(error);

        throw new CustomError(error.message, 500);
      }
    },

    updateDigitalProduct: async (
      _,
      { id, input, images = [], deleteImages = [] }
    ) => {
      try {
        const product = await DigitalProduct.findById(id).populate("category");
        if (!product) throw new CustomError("Product not found", 404);

        const existingImages = product.images;

        const remainingImages = existingImages.filter(
          (image) => !deleteImages.includes(image)
        );

        const totalImagesCount = remainingImages.length + images.length;
        if (totalImagesCount > 5) {
          throw new CustomError(
            "You can only have up to 5 images per product.",
            400
          );
        }

        if (deleteImages.length > 0) {
          await Promise.all(
            deleteImages.map((imageUrl) => deleteImageFromStorage(imageUrl))
          );
        }

        let uploadedImages = [];
        if (images && images.length > 0) {
          uploadedImages = await Promise.all(
            images.map((image) => upload(image, `digitalProducts/`))
          );
        }

        product.images = [...remainingImages, ...uploadedImages];

        Object.assign(product, input);

        await product.save();

        return product;
      } catch (error) {
        console.log(error);
        throw new CustomError(error.message, 500);
      }
    },

    deleteDigitalProduct: async (_, { id }) => {
      try {
        const product = await DigitalProduct.findById(id);
        if (!product) throw new CustomError("Product not found", 404);

        if (product.images && product.images.length > 0) {
          await Promise.all(
            product.images.map((imageUrl) => deleteImageFromStorage(imageUrl))
          );
        }

        const result = await DigitalProduct.findByIdAndDelete(id);

        return !!result;
      } catch (error) {
        throw new CustomError(error.message, 500);
      }
    },
  },
};

module.exports = productResolvers;
