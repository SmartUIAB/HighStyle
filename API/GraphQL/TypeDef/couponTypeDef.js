const { gql } = require("apollo-server-express");

const couponTypeDef = gql`
  # coupon.graphql
  type Coupon {
    id: ID!
    name: String!
    code: String!
    startDate: String!
    endDate: String!
    allowFreeShipping: Boolean!
    quantity: Int!
    discountType: discountType!
    discountValue: Float!
    minSpend: Float
    maxSpend: Float
    restrictionProducts: [ID!]!
    usageLimit: Int
    perCustomerLimit: Int
    statusActive: Boolean!
  }

  enum discountType {
    percentage
    fixed
  }

  input CreateCouponInput {
    name: String!
    code: String!
    startDate: String!
    endDate: String!
    allowFreeShipping: Boolean = false
    quantity: Int!
    discountType: discountType!
    discountValue: Float!
    minSpend: Float
    maxSpend: Float
    restrictionProducts: [ID!]
    usageLimit: Int
    perCustomerLimit: Int
    statusActive: Boolean = true
  }

  input PaginationInput {
    page: Int = 1
    limit: Int = 10
  }

  type CouponPagination {
    coupons: [Coupon!]!
    currentPage: Int!
    totalPages: Int!
    total: Int!
  }

  type Query {
    getAllCoupons(pagination: PaginationInput): CouponPagination
  }

  type Mutation {
    createCoupon(input: CreateCouponInput!): Coupon!
    deleteCoupons(ids: [ID!]!): Boolean!
    updateCoupon(id: ID!, input: CreateCouponInput!): Coupon!
  }
`;

module.exports = couponTypeDef;
