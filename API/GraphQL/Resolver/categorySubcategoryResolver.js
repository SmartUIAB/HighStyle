const { upload } = require("../../Utilities/upload");
const Category = require("../../Model/categoryModel");
const Subcategory = require("../../Model/subCategoryModel");
const CustomError = require("../../Utilities/CustomError");
const {
  deleteImageFromStorage,
} = require("../../Utilities/miscellaneousUtils");

const categorySubcategoryResolver = {
  /* ---------------------------------- Query --------------------------------- */
  Query: {
    categories: async (_, { pagination }, context) => {
      const { page = 1, limit = 10 } = pagination || {};
      try {
        const categories = await Category.find()
          .skip((page - 1) * limit)
          .limit(limit);
        return {
          categories,
          totalPages: Math.ceil((await Category.countDocuments()) / limit),
          currentPage: page,
          total: await Category.countDocuments(),
        };
      } catch (error) {
        throw new CustomError("Failed to fetch categories", 500);
      }
    },
    category: async (_, { id }) => {
      try {
        return await Category.findById(id);
      } catch (error) {
        throw new CustomError("Category not found", 404);
      }
    },
    subcategories: async (_, { pagination }) => {
      const { page = 1, limit = 10 } = pagination || {};
      try {
        const subcategories = await Subcategory.find()
          .skip((page - 1) * limit)
          .limit(limit);
        return {
          subcategories,
          totalPages: Math.ceil((await Subcategory.countDocuments()) / limit),
          currentPage: page,
          total: await Subcategory.countDocuments(),
        };
      } catch (error) {
        throw new CustomError("Failed to fetch subcategories", 500);
      }
    },
    subcategory: async (_, { id }) => {
      try {
        return await Subcategory.findById(id);
      } catch (error) {
        throw new CustomError("Subcategory not found", 404);
      }
    },
  },
  /* -------------------------------- Mutation -------------------------------- */
  Mutation: {
    createCategory: async (_, { name, type, description, image }) => {
      try {
        let imagePath = null;
        if (image) {
          imagePath = await upload(image[0], "categories");
        }
        const category = new Category({
          name,
          type,
          description,
          image: imagePath,
        });
        return category.save();
      } catch (error) {
        throw new CustomError(error.message, 500);
      }
    },

    updateCategory: async (_, { id, name, type, description, image }) => {
      try {
        /* ---------- Fetch the existing category to get the current image ---------- */
        const existingCategory = await Category.findById(id);

        if (!existingCategory) {
          throw new CustomError("Category not found", 404);
        }

        const updateFields = {};

        if (name) updateFields.name = name;
        if (type) updateFields.type = type;
        if (description) updateFields.description = description;

        if (image) {
          /* ---------------- Delete the existing image if there is one --------------- */
          if (existingCategory.image) {
            await deleteImageFromStorage(existingCategory.image);
          }

          /* -------------------------- Upload the new image -------------------------- */
          updateFields.image = await upload(image, "categories");
        }

        return await Category.findByIdAndUpdate(id, updateFields, {
          new: true,
        });
      } catch (error) {
        throw new CustomError("Failed to update category", 500);
      }
    },

    deleteCategory: async (_, { id }) => {
      try {
        const existingCategory = await Category.findById(id);

        if (!existingCategory) {
          throw new CustomError("Category not found", 404);
        }
        if (existingCategory.image) {
          await deleteImageFromStorage(existingCategory.image);
        }

        const result = await Category.findByIdAndDelete(id);
        return !!result;
      } catch (error) {
        throw new CustomError("Failed to delete category", 500);
      }
    },

    createSubcategory: async (_, { name, description, image, categoryId }) => {
      try {
        console.log(name, description, image, "******-------");

        let imagePath = null;
        if (image) {
          imagePath = await upload(image, "subcategories");
        }
        const subcategory = new Subcategory({
          name,
          description,
          image: imagePath,
          category_id: categoryId,
        });
        return subcategory.save();
      } catch (error) {
        throw new CustomError("Failed to create subcategory", 500);
      }
    },

    updateSubcategory: async (_, { id, name, description, image }) => {
      try {
        /* ---------- Fetch the existing category to get the current image ---------- */
        const existingSubCategory = await Subcategory.findById(id);

        if (!existingSubCategory) {
          throw new CustomError("Category not found", 404);
        }

        const updateFields = {};

        if (name) updateFields.name = name;
        if (description) updateFields.description = description;

        if (image) {
          /* ---------------- Delete the existing image if there is one --------------- */
          if (existingSubCategory.image) {
            await deleteImageFromStorage(existingSubCategory.image);
          }

          /* -------------------------- Upload the new image -------------------------- */
          updateFields.image = await upload(image, "subcategories");
        }

        return await Subcategory.findByIdAndUpdate(id, updateFields, {
          new: true,
        });
      } catch (error) {
        throw new Error("Failed to update subcategory");
      }
    },

    deleteSubcategory: async (_, { id }) => {
      try {
        const existingCategory = await Subcategory.findById(id);
        if (!existingCategory) {
          throw new CustomError("Category not found", 404);
        }
        if (existingCategory.image) {
          await deleteImageFromStorage(existingCategory.image);
        }
        const result = await Subcategory.findByIdAndDelete(id);
        return !!result;
      } catch (error) {
        throw new CustomError("Failed to delete subcategory", 500);
      }
    },
  },
};

module.exports = categorySubcategoryResolver;
