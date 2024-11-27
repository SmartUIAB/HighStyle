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
    createCategory: async (_, { name, type, description, image }, context) => {
      try {
        let company = await Company.findById(context.user.company);

        let imagePath = null;
        if (image) {
          let imagedata = [image];
          imagePath = await upload(
            imagedata[0],
            `${company.name}/categories/${type}`
          );
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
          // Delete the existing image if there's a new one provided
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
          // If the type has changed and there's an existing image, move it to the new type folder
          if (existingCategory.image) {
            const oldImagePath = existingCategory.image;
            const newImagePath = `${company.name.replace(
              /\s+/g,
              ""
            )}/categories/${type}/${oldImagePath.split("/").pop()}`;

            await moveImageInStorage(oldImagePath, newImagePath); // Implement this function to move files in storage
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
      { name, description, image, categoryId },
      context
    ) => {
      try {
        // Validate required fields
        if (!name || !categoryId) {
          throw new CustomError("Name and Category ID are required", 400);
        }

        // Fetch company details
        const company = await Company.findById(context.user.company);
        if (!company) {
          throw new CustomError("Company not found", 404);
        }

        // Handle image upload if provided
        let imagePath = null;
        if (image) {
          const imagedata = [image];
          imagePath = await upload(
            imagedata[0],
            `${company.name.replace(/\s+/g, "")}/subcategories/${type}`
          );
        }

        // Create subcategory instance
        const subcategory = new Subcategory({
          name,
          description: description || "",
          image: imagePath,
          category_id: categoryId,
          company: company._id,
        });

        // Save and return the created subcategory
        return await subcategory.save();
      } catch (error) {
        console.error("Error creating subcategory:", error);
        throw new CustomError(
          error.message || "Failed to create subcategory",
          error.status || 500
        );
      }
    },

    updateSubcategory: async (_, { id, name, description, image }, context) => {
      try {
        let company = await Company.findById(context.user.company);
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
