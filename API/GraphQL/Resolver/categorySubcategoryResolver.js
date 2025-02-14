const { upload } = require("../../Utilities/upload");
const Category = require("../../Model/categoryModel");
const Subcategory = require("../../Model/subCategoryModel");
const CustomError = require("../../Utilities/CustomError");
const {
  deleteImageFromStorage,
} = require("../../Utilities/miscellaneousUtils");
const Company = require("../../Model/companyModel");

const categorySubcategoryResolver = {
  /* ---------------------------------- Query --------------------------------- */
  Query: {
    categories: async (_, { pagination }) => {
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
    categorieslist: async (root, args, context) => {
      if (!context.userId) {
        throw new CustomError("Not authenticated", 401);
      }
      try {
        const category = await Category.find();
        if (!category) {
          throw new CustomError("Category not found", 404);
        }
        return category;
      } catch (error) {
        console.error("Error fetching category:", error);
        throw new CustomError(error.message, 500);
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
    subcategorieslist: async (root, args, context) => {
      if (!context.userId) {
        throw new CustomError("Not authenticated", 401);
      }
      try {
        const subcategory = await Subcategory.find();
        if (!subcategory) {
          throw new CustomError("Subcategory not found", 404);
        }
        return subcategory;
      } catch (error) {
        console.error("Error fetching subcategory:", error);
        throw new CustomError(error.message, 500);
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
    createCategory: async (_, { name, type, description, image }, context) => {
      try {
        let company = await Company.findById(context.user.company);

        let imagePath = null;
        if (image) {
          imagePath = await upload(image, `${company.name}/categories/${type}`);
        }
        const category = new Category({
          name,
          type,
          description,
          image: imagePath,
          company: company._id,
        });
        return category.save();
      } catch (error) {
        throw new CustomError(error.message, 500);
      }
    },

    updateCategory: async (
      _,
      { id, name, type, description, image },
      context
    ) => {
      try {
        let company = await Company.findById(context.user.company);

        // Fetch the existing category to get current details
        const existingCategory = await Category.findById(id);

        if (!existingCategory) {
          throw new CustomError("Category not found", 404);
        }

        const updateFields = {};
        if (name) updateFields.name = name;
        if (type) updateFields.type = type;
        if (description) updateFields.description = description;

        if (image) {
          if (existingCategory.image) {
            await deleteImageFromStorage(existingCategory.image);
          }

          // Upload the new image
          updateFields.image = await upload(
            image,
            `${company.name.replace(/\s+/g, "")}/categories/${
              type || existingCategory.type
            }`
          );
        } else if (type && type !== existingCategory.type) {
          if (existingCategory.image) {
            const oldImagePath = existingCategory.image;
            const newImagePath = `${company.name.replace(
              /\s+/g,
              ""
            )}/categories/${type}/${oldImagePath.split("/").pop()}`;

            await moveImageInStorage(oldImagePath, newImagePath);
            updateFields.image = newImagePath;
          }
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

    createSubcategory: async (
      _,
      { name, description, type, image, categoryId },
      context
    ) => {
      try {
        if (!name || !categoryId) {
          throw new CustomError("Name and Category ID are required", 400);
        }

        const company = await Company.findById(context.user.company);
        if (!company) {
          throw new CustomError("Company not found", 404);
        }

        let imagePath = null;
        if (image) {
          imagePath = await upload(
            image,
            `${company.name.replace(/\s+/g, "")}/subcategories/${type}`
          );
        }

        const subcategory = new Subcategory({
          name,
          description: description || "",
          image: imagePath,
          type: type,
          category_id: categoryId,
          company: company._id,
        });

        return await subcategory.save();
      } catch (error) {
        console.error("Error creating subcategory:", error);
        throw new CustomError(
          error.message || "Failed to create subcategory",
          error.status || 500
        );
      }
    },

    updateSubcategory: async (
      _,
      { id, name, description, type, image },
      context
    ) => {
      try {
        let company = await Company.findById(context.user.company);
        const existingSubCategory = await Subcategory.findById(id);

        if (!existingSubCategory) {
          throw new CustomError("Category not found", 404);
        }

        const updateFields = {};

        if (name) updateFields.name = name;
        if (description) updateFields.description = description;
        if (type) updateFields.type = type;

        if (image) {
          if (existingSubCategory.image) {
            await deleteImageFromStorage(existingSubCategory.image);
          }

          updateFields.image = await upload(
            image,
            `${company.name.replace(/\s+/g, "")}/subcategories/${type}`
          );
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
