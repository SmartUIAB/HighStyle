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
`;

module.exports = typeDefs;
