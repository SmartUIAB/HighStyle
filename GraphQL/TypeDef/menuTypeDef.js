const { gql } = require("apollo-server");

const menuTypeDefs = gql`
  type Menu {
    id: ID!
    name: String!
    isCouponEnabled: Boolean!
    company: ID!
  }

  type Query {
    menus: [Menu!]!
    menu(id: ID!): Menu
  }

  type Mutation {
    createMenu(name: String!, isCouponEnabled: Boolean!): Menu!
    updateMenu(id: ID!, name: String, isCouponEnabled: Boolean): Menu!
    deleteMenu(id: ID!): Boolean!
  }
`;

module.exports = menuTypeDefs;
