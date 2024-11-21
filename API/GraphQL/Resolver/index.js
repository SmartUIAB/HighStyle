const categorySubcategoryResolver = require("./categorySubcategoryResolver");
const fieldResolver = require("./fieldResolver");
const userResolver = require("./userResolver");

const resolver = {
  Query: {
    ...userResolver.Query,
    ...categorySubcategoryResolver.Query,
  },
  Mutation: {
    ...userResolver.Mutation,
    ...categorySubcategoryResolver.Mutation,
  },
  Category: {
    ...fieldResolver.Category,
  },
  Subcategory: {
    ...fieldResolver.Subcategory,
  },
};

module.exports = resolver;
