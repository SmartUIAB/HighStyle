const gql = require("graphql-tag");

const salesTypeDef = gql`
  type Order {
    id: ID!
    user: User!
    products: [OrderProduct!]!
    finalTotal: Float!
    paymentStatus: PaymentStatus!
    orderStatus: OrderStatus!
    shippingAddress: ShippingAddressType
    createdAt: String!
    updatedAt: String!
  }

  type Transaction {
    id: ID!
    order: Order
    transactionAmount: Float!
    transactionStatus: TransactionStatus!
    paymentGateway: String!
    transactionId: String!
    createdAt: String!
  }

  enum TransactionStatus {
    PENDING
    SUCCESSFUL
    FAILED
    PARTIALLY_REFUNDED
    REFUNDED
  }

  enum ProductType {
    PHYSICAL
    DIGITAL
  }

  type OrderProduct {
    productType: ProductType!
    productId: ID!
    quantity: Int!
  }

  type ShippingAddressType {
    street: String!
    city: String!
    state: String!
    postalCode: String!
    country: String!
  }

  enum OrderStatus {
    PENDING
    SHIPPED
    DELIVERED
    COMPLETED
    CANCELED
  }

  enum PaymentStatus {
    PENDING
    PAID
    FAILED
    CASH_ON_DELIVERY
    PARTIALLY_REFUNDED
    REFUNDED
  }

  type CreateOrderResponse {
    user: ID!
    orderId: ID!
    products: [OrderProduct!]!
    finalTotal: Float!
    discountApplied: Float!
    shippingAddress: ShippingAddressType!
    paymentStatus: PaymentStatus!
    orderStatus: OrderStatus!
  }

  input ShippingAddressInput {
    street: String!
    city: String!
    state: String!
    postalCode: String!
    country: String!
  }

  input OrderProductInput {
    productType: ProductType!
    productId: ID!
    quantity: Int!
  }

  type PaginatedOrders {
    totalCount: Int!
    totalPages: Int!
    currentPage: Int!
    orders: [Order!]!
  }

  type PaginatedTransactions {
    totalCount: Int!
    totalPages: Int!
    currentPage: Int!
    transactions: [Transaction!]!
  }

  type Query {
    getOrderById(id: ID!): Order
    getAllOrders(page: Int, limit: Int): PaginatedOrders
    getTransactionById(id: ID!): Transaction
    getAllTransactions(page: Int, limit: Int): PaginatedTransactions
  }

  type Mutation {
    createOrder(
      userId: ID!
      products: [OrderProductInput!]!
      shippingAddress: ShippingAddressInput!
      couponCode: String
    ): CreateOrderResponse
    updateOrderStatus(
      orderId: ID!
      orderStatus: OrderStatus!
      paymentStatus: PaymentStatus!
    ): Order
    updateTransactionStatus(
      transactionId: ID!
      transactionStatus: TransactionStatus!
    ): Transaction
  }
`;

module.exports = salesTypeDef;
