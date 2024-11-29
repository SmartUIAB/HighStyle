const { gql } = require("apollo-server");
const userTypeDefs = require("./userTypeDef");
const categorySubcategoryTypeDef = require("./categorySubcategoryTypeDef");
const productTypeDef = require("./productTypeDef");
const couponTypeDef = require("./couponTypeDef");
const permissionsTypeDef = require("./permissionsTypeDef");
const vendorTypeDefs = require("./vendorTypeDef");

const typeDefs = gql`
  ${userTypeDefs}
  ${categorySubcategoryTypeDef}
  ${productTypeDef}
  ${couponTypeDef}
  ${permissionsTypeDef}
  ${vendorTypeDefs}
`;

module.exports = typeDefs;
