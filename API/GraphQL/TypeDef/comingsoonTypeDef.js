// schema.js
const gql = require("graphql-tag");

const comingsoonTypeDef = gql`
  type ComingSoon {
    id: ID!
    email: String!
    createdAt: String!
  }

  type Query {
    getAllEmails: [ComingSoon!]!
  }

  type Mutation {
    notifyMe(email: String!): String
  }
`;

module.exports = comingsoonTypeDef;
