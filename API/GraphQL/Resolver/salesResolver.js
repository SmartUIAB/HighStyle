"use strict";
const Order = require("../../Model/orderModel");
const Transaction = require("../../Model/transactionModel");
const CustomError = require("../../Utilities/CustomError");
const { objectId, pagination } = require("../../Security/access");

function orderView(order) {
  if (!order) return null;
  const row = order.toObject ? order.toObject() : order;
  const customer = row.customer;
  if (!customer?._id || !customer.email) throw new CustomError("Legacy order requires customer-data reconciliation", 409);
  return { ...row, id: String(row._id), user: { id: String(customer._id), email: customer.email, firstname: customer.firstname, lastname: customer.lastname } };
}
function transactionView(transaction) {
  const row = transaction.toObject ? transaction.toObject() : transaction;
  return { ...row, id: String(row._id), order: row.order ? orderView(row.order) : null };
}
const customerFields = "firstname lastname email";
const transition = { PENDING: ["SHIPPED", "CANCELED"], SHIPPED: ["DELIVERED"], DELIVERED: ["COMPLETED"], COMPLETED: [], CANCELED: [] };
const disabled = async () => { throw new CustomError("Financial state changes require the payment workflow", 403); };

// Every operation in this module is protected by resolverPolicy at the schema boundary.
module.exports = {
  Query: {
    getOrderById: async (_, { id }) => orderView(await Order.findById(objectId(id)).populate("customer", customerFields)),
    getAllOrders: async (_, args) => {
      const { page, limit, skip } = pagination(args.page ?? 1, args.limit ?? 10);
      const [orders, totalCount] = await Promise.all([Order.find().sort({ createdAt: -1 }).populate("customer", customerFields).skip(skip).limit(limit), Order.countDocuments()]);
      return { orders: orders.map(orderView), totalCount, totalPages: Math.ceil(totalCount / limit), currentPage: page };
    },
    getTransactionById: async (_, { id }) => {
      const item = await Transaction.findById(objectId(id)).populate({ path: "order", populate: { path: "customer", select: customerFields } });
      return item ? transactionView(item) : null;
    },
    getAllTransactions: async (_, args) => {
      const { page, limit, skip } = pagination(args.page ?? 1, args.limit ?? 10);
      const [items, totalCount] = await Promise.all([Transaction.find().sort({ createdAt: -1 }).populate({ path: "order", populate: { path: "customer", select: customerFields } }).skip(skip).limit(limit), Transaction.countDocuments()]);
      return { transactions: items.map(transactionView), totalCount, totalPages: Math.ceil(totalCount / limit), currentPage: page };
    },
  },
  Mutation: {
    createOrder: disabled,
    updateTransactionStatus: disabled,
    updateOrderStatus: async (_, { orderId, orderStatus, paymentStatus }) => {
      const order = await Order.findById(objectId(orderId));
      if (!order) throw new CustomError("Order not found", 404);
      if (paymentStatus !== order.paymentStatus) throw new CustomError("Payment status cannot be changed manually", 403);
      if (orderStatus !== order.orderStatus && !transition[order.orderStatus]?.includes(orderStatus)) throw new CustomError("Invalid fulfillment transition", 409);
      if (orderStatus === "SHIPPED" && !["PAID", "CASH_ON_DELIVERY"].includes(order.paymentStatus)) throw new CustomError("Payment is required before shipment", 409);
      if (orderStatus === "CANCELED" && ["PAID", "PARTIALLY_REFUNDED"].includes(order.paymentStatus)) throw new CustomError("Reconcile/refund the payment before cancellation", 409);
      const updated = await Order.findOneAndUpdate({ _id: order._id, orderStatus: order.orderStatus, paymentStatus: order.paymentStatus }, { $set: { orderStatus } }, { new: true, runValidators: true }).populate("customer", customerFields);
      if (!updated) throw new CustomError("Order changed; refresh and retry", 409);
      return orderView(updated);
    },
  },
};
