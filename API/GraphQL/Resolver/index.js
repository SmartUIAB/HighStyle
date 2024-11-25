const categorySubcategoryResolver = require("./categorySubcategoryResolver");
const couponResolver = require("./couponResolver");
const fieldResolver = require("./fieldResolver");
const productResolvers = require("./productResolver");
const userResolver = require("./userResolver");

const resolver = {
  Query: {
    ...userResolver.Query,
    ...categorySubcategoryResolver.Query,
    ...couponResolver.Query,
    ...productResolvers.Query,
  },
  Mutation: {
    ...userResolver.Mutation,
    ...categorySubcategoryResolver.Mutation,
    ...productResolvers.Mutation,
    ...couponResolver.Mutation,
  },
  Category: {
    ...fieldResolver.Category,
  },
  Subcategory: {
    ...fieldResolver.Subcategory,
  },
  PhysicalProduct: {
    ...fieldResolver.PhysicalProduct,
  },
  DigitalProduct: {
    ...fieldResolver.DigitalProduct,
  },
};

module.exports = resolver;
