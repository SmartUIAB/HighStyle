const { gql } = require("apollo-server");
const userTypeDefs = require("./userTypeDef");
const categorySubcategoryTypeDef = require("./categorySubcategoryTypeDef");
const productTypeDef = require("./productTypeDef");
const couponTypeDef = require("./couponTypeDef");
const permissionsTypeDef = require("./permissionsTypeDef");
const vendorTypeDefs = require("./vendorTypeDef");
const salesTypeDef = require("./salesTypeDef");
const mediaTypeDef = require("./mediaTypeDef");
const customerTypeDef = require("./customerTypeDef");
const menuTypeDefs = require("./menuTypeDef");
const pageTypeDef = require("./pageTypeDef");
const cartTypeDefs = require("./cartTypeDef");
const orderTypeDefs = require("./orderTypeDef");
const notificationTypeDefs = require("./notificationTypeDef");
const favouriteTypeDef = require("./favouriteTypeDef");
const reviewTypeDef = require("./reviewTypeDef")

const typeDefs = gql`
  ${userTypeDefs}
  ${categorySubcategoryTypeDef}
  ${productTypeDef}
  ${couponTypeDef}
  ${permissionsTypeDef}
  ${vendorTypeDefs}
  ${salesTypeDef}
  ${mediaTypeDef}
  ${customerTypeDef}
  ${menuTypeDefs}
  ${pageTypeDef}
  ${cartTypeDefs}
  ${orderTypeDefs}
  ${notificationTypeDefs}
  ${favouriteTypeDef}
  ${reviewTypeDef}
`;

module.exports = typeDefs;
