const gql = require("graphql-tag");

const pageTypeDef = gql`
  type Page {
    _id: ID!
    name: String!
    description: String!
    status: Boolean!
    metaTitle: String!
    metaDescription: String!
    company: ID!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    getPage(id: ID!): Page
    listPages: [Page]
  }

  type Mutation {
    createPage(input: PageInput!): Page
    updatePage(id: ID!, input: PageInput!): Page
    deletePage(id: ID!): Page
  }

  input PageInput {
    name: String!
    description: String!
    status: Boolean
    metaTitle: String!
    metaDescription: String!
  }
`;

module.exports = pageTypeDef;
