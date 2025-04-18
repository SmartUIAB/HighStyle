const { gql } = require("apollo-server-express");

const permissionsTypeDef = gql`
  type Permission {
    id: ID!
    name: String!
    description: String!
    module: String!
  }

  type Query {
    permissions: [Permission]
  }
`;

module.exports = permissionsTypeDef;
