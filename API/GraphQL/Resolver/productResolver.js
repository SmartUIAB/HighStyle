const PhysicalProduct = require("../../Model/physicalProductModel");
const DigitalProduct = require("../../Model/digitalProductModel");
const { upload } = require("../../Utilities/upload");
const CustomError = require("../../Utilities/CustomError");
const {
  deleteImageFromStorage,
} = require("../../Utilities/miscellaneousUtils");
const Company = require("../../Model/companyModel");
const { checkPermission } = require("../../Utilities/permissionMiddleware");
const { listCatalog } = require("../../Services/catalogListing");

const productResolvers = {
  Query: {
    physicalProducts: (_, args) => listCatalog(PhysicalProduct, args, true),
    physicalProduct: async (_, { id }) => {
      try {
        return await PhysicalProduct.findById(id);
      } catch (error) {
        throw new CustomError("Physical product not found", 404);
      }
    },
    digitalProducts: (_, args) => listCatalog(DigitalProduct, args),
    digitalProduct: async (_, { id }) => {
      try {
        return await DigitalProduct.findById(id);
      } catch (error) {
        throw new CustomError("Digital product not found", 404);
      }
    },
  },

  Mutation: {
    createPhysicalProduct: checkPermission({
      module: "Products",
      name: "Add Products",
    })(async (_, { input, images }, context) => {
      try {
        let company = await Company.findById(context.user.company);
        const product = new PhysicalProduct({
          ...input,
          company: company._id,
        });
        if (images && images.length > 0) {
          if (images.length > 5) {
            throw new CustomError("You can only upload up to 5 images.", 400);
          }

          const imagePaths = [];
          for (let image of images) {
            const uploadedImagePath = await upload(
              image,
              `${company.name.replace(/\s+/g, "")}/Products/physicalProducts`
            );
            imagePaths.push(uploadedImagePath);
          }

          product.images = imagePaths;
        }
        return await product.save();
      } catch (error) {
        throw new CustomError(error.message, 500);
      }
    }),

    updatePhysicalProduct: checkPermission({
      module: "Products",
      name: "Edit Products",
    })(async (_, { id, input, images = [], deleteImages = [] }, context) => {
      try {
        let company = await Company.findById(context.user.company);
        const product = await PhysicalProduct.findById(id).populate("category");
        if (!product) throw new CustomError("Product not found", 404);
        if (input.stockQuantity != null && (!Number.isSafeInteger(input.stockQuantity) || input.stockQuantity < product.reservedQuantity)) {
          throw new CustomError("Stock cannot be negative or lower than the quantity reserved by checkouts", 409);
        }

        const existingImages = product.images;
        const remainingImages = existingImages.filter(
          (image) => !deleteImages?.includes(image)
        );

        const totalImagesCount = remainingImages?.length + images?.length;
        if (totalImagesCount > 5) {
          throw new CustomError(
            "You can only have up to 5 images per product.",
            400
          );
        }

        if (deleteImages?.length > 0) {
          await Promise.all(
            deleteImages.map((imageUrl) => deleteImageFromStorage(imageUrl))
          );
        }

        let uploadedImages = [];
        if (images && images.length > 0) {
          uploadedImages = await Promise.all(
            images.map((image) =>
              upload(
                image,
                `${company.name.replace(/\s+/g, "")}/Products/physicalProducts`
              )
            )
          );
        }

        product.images = [...remainingImages, ...uploadedImages];

        Object.assign(product, input);

        await product.save();

        return product;
      } catch (error) {
        console.log(error);

        if (error.name === "VersionError") throw new CustomError("Stock changed during this edit. Refresh the product and retry.", 409);
        throw new CustomError(error.message, error.statusCode || 500);
      }
    }),

    deletePhysicalProduct: checkPermission({
      module: "Products",
      name: "Delete Products",
    })(async (_, { id }) => {
      try {
        const product = await PhysicalProduct.findById(id);
        if (!product) throw new CustomError("Product not found", 404);

        const result = await PhysicalProduct.findOneAndDelete({
          _id: product._id, __v: product.__v,
          $or: [{ reservedQuantity: 0 }, { reservedQuantity: { $exists: false } }],
        });
        if (!result) throw new CustomError("This product has active reservations or changed. Refresh and try again after its checkouts finish.", 409);

        if (product.images && product.images.length > 0) {
          await Promise.all(
            product.images.map((imageUrl) => deleteImageFromStorage(imageUrl))
          );
        }

        return !!result;
      } catch (error) {
        console.log(error);
        throw new CustomError(error.message, error.statusCode || 500);
      }
    }),

    /* ----------- Digital product mutations with image upload support ---------- */
    createDigitalProduct: checkPermission({
      module: "Products",
      name: "Add Products",
    })(async (_, { input, images }, context) => {
      try {
        let company = await Company.findById(context.user.company);
        const product = new DigitalProduct({
          ...input,
          company: company._id,
        });

        if (images && images.length > 0) {
          if (images.length > 5) {
            throw new CustomError("You can only upload up to 5 images.", 400);
          }

          const imagePaths = [];
          for (let image of images) {
            const uploadedImagePath = await upload(
              image,
              `${company.name.replace(/\s+/g, "")}/Products/digitalProducts`
            );
            imagePaths.push(uploadedImagePath);
          }

          product.images = imagePaths;
        }

        return await product.save();
      } catch (error) {
        console.log(error);

        throw new CustomError(error.message, 500);
      }
    }),

    updateDigitalProduct: checkPermission({
      module: "Products",
      name: "Edit Products",
    })(async (_, { id, input, images = [], deleteImages = [] }, context) => {
      try {
        let company = await Company.findById(context.user.company);

        const product = await DigitalProduct.findById(id).populate("category");
        if (!product) throw new CustomError("Product not found", 404);

        const existingImages = product.images;

        const remainingImages = existingImages.filter(
          (image) => !deleteImages?.includes(image)
        );

        const totalImagesCount = remainingImages?.length + images?.length;
        if (totalImagesCount > 5) {
          throw new CustomError(
            "You can only have up to 5 images per product.",
            400
          );
        }

        if (deleteImages?.length > 0) {
          await Promise.all(
            deleteImages.map((imageUrl) => deleteImageFromStorage(imageUrl))
          );
        }

        let uploadedImages = [];
        if (images && images?.length > 0) {
          uploadedImages = await Promise.all(
            images.map((image) =>
              upload(
                image,
                `${company.name.replace(/\s+/g, "")}/Products/digitalProducts`
              )
            )
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
    }),

    deleteDigitalProduct: checkPermission({
      module: "Products",
      name: "Delete Products",
    })(async (_, { id }) => {
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
    }),
  },
};

module.exports = productResolvers;
