import { gql } from "@apollo/client";

export const GET_DASHBOARD_CARDS = gql`
  query GetAllCardDashboard {
    getAllCardDashboard {
      earning
      vendors
      message
      products
    }
  }
`;