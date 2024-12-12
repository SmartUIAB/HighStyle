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

export const GET_COUPON_BY_ID = gql`
  query GetCouponByID($getCouponByIdId: ID!) {
    getCouponByID(id: $getCouponByIdId) {
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
  }
`;
