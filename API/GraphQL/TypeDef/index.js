const { gql } = require("apollo-server");
const userTypeDefs = require("./userTypeDef");
const categorySubcategoryTypeDef = require("./categorySubcategoryTypeDef");
const productTypeDef = require("./productTypeDef");
const couponTypeDef = require("./couponTypeDef");

const typeDefs = gql`
  ${userTypeDefs}
  ${categorySubcategoryTypeDef}
  ${productTypeDef}
  ${couponTypeDef}
`;

module.exports = typeDefs;
