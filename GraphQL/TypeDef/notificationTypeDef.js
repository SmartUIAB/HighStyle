const { gql } = require("apollo-server");

const notificationTypeDefs = gql`
  type Notification {
    id: ID!
    message: String!
    isNotified: Boolean!
    createdAt: String!
  }

  type Query {
    getAllNotification: [Notification!]!
  }
`;

module.exports = notificationTypeDefs;
