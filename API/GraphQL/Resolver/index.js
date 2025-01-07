const categorySubcategoryResolver = require("./categorySubcategoryResolver");
const couponResolver = require("./couponResolver");
const fieldResolver = require("./fieldResolver");
const permissionsResolver = require("./permissionsResolver");
const productResolvers = require("./productResolver");
const cartResolvers = require("./cartResolver");
const userResolver = require("./userResolver");
const vendorResolver = require("./vendorResolver");
const salesResolver = require("./salesResolver");
const mediaResolver = require("./mediaResolver");
const customerResolver = require("./customerResolver");
const menuResolvers = require("./menuResolver");
const pageResolvers = require("./pageResolver");
const orderResolvers = require("./orderResolver");
const notificationResolver = require("./notificationResolver");

const resolver = {
  Query: {
    ...userResolver.Query,
    ...categorySubcategoryResolver.Query,
    ...couponResolver.Query,
    ...productResolvers.Query,
    ...cartResolvers.Query,
    ...permissionsResolver.Query,
    ...vendorResolver.Query,
    ...salesResolver.Query,
    ...mediaResolver.Query,
    ...menuResolvers.Query,
    ...pageResolvers.Query,
    ...notificationResolver.Query
  },
  Mutation: {
    ...userResolver.Mutation,
    ...categorySubcategoryResolver.Mutation,
    ...productResolvers.Mutation,
    ...cartResolvers.Mutation,
    ...couponResolver.Mutation,
    ...vendorResolver.Mutation,
    ...salesResolver.Mutation,
    ...mediaResolver.Mutation,
    ...customerResolver.Mutation,
    ...menuResolvers.Mutation,
    ...pageResolvers.Mutation,
    ...orderResolvers.Mutation,
    ...notificationResolver.Mutation
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
