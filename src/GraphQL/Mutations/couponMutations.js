import { gql } from "@apollo/client";

export const CREATE_COUPON = gql`
  mutation CreateCoupon($input: CreateCouponInput!) {
    createCoupon(input: $input) {
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

export const DELETE_COUPON = gql`
  mutation Mutation($ids: [ID!]!) {
    deleteCoupons(ids: $ids)
  }
`;

export const UPDATE_COUPON = gql`
  mutation UpdateCoupon($updateCouponId: ID!, $input: CreateCouponInput!) {
    updateCoupon(id: $updateCouponId, input: $input) {
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