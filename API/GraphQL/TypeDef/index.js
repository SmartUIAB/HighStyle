const { gql } = require("apollo-server");
const userTypeDefs = require("./userTypeDef");
const categorySubcategoryTypeDef = require("./categorySubcategoryTypeDef");

const typeDefs = gql`
  ${userTypeDefs}
  ${categorySubcategoryTypeDef}
`;

module.exports = typeDefs;
