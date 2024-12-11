import { gql } from "@apollo/client";

export const COUPON_LIST = gql`
  query GetAllCoupons {
    getAllCoupons {
      coupons {
        id
        name
        code
        startDate
        endDate
        allowFreeShipping
        quantity
        discountType
        discountValue
        minSpend
        maxSpend
        restrictionProducts
        usageLimit
        perCustomerLimit
        statusActive
      }
      currentPage
      totalPages
      total
    }
  }
`;
