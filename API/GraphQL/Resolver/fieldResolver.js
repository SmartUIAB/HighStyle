const Category = require("../../Model/categoryModel");
const Subcategory = require("../../Model/subCategoryModel");
const CustomError = require("../../Utilities/CustomError");

const fetchCategory = async (id) => {
  try {
    return await Category.findById(id);
  } catch (error) {
    throw new CustomError("Failed to fetch category", 500);
  }
};

const fetchSubcategory = async (id) => {
  try {
    return await Subcategory.findById(id);
  } catch (error) {
    throw new CustomError("Failed to fetch subcategory", 500);
  }
};

const fieldResolver = {
  Category: {
    subcategories: async (parent) => {
      try {
        return await Subcategory.find({ category_id: parent.id });
      } catch (error) {
        throw new CustomError("Failed to fetch subcategories", 500);
      }
    },
  },

  Subcategory: {
    category: (parent) => fetchCategory(parent.category_id),
  },

  PhysicalProduct: {
    availableQuantity: (parent) => require("../../Services/inventory").availableQuantity(parent),
    category: (parent) => fetchCategory(parent.category),
    subcategory: (parent) => fetchSubcategory(parent.subcategory),
  },

  DigitalProduct: {
    category: (parent) => fetchCategory(parent.category),
    subcategory: (parent) => fetchSubcategory(parent.subcategory),
  },
};

module.exports = fieldResolver;
