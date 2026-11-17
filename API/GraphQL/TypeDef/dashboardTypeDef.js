const gql = require("graphql-tag");

const dashboardTypeDef = gql`
  type DashboardStats {
    earning: Float!
    vendors: Int!
    message: Int!
    products: Int!
  }

  # Root Query Type
  type Query {
    getAllCardDashboard: DashboardStats!
  }
`;

module.exports = dashboardTypeDef;