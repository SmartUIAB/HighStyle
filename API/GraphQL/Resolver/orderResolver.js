"use strict";
const Order = require("../../Model/orderModel");
const CustomError = require("../../Utilities/CustomError");
const { requireCustomer } = require("../../Security/access");
const { createCheckout } = require("../../Services/checkout");
const { cancelCheckout } = require("../../Services/reservationReconciliation");

module.exports = {
  Query: {
    GetMyOrder: async (_, { customerId }, context) => {
      requireCustomer(context, customerId);
      return Order.find({ customer: customerId }).sort({ createdAt: -1 }).limit(100);
    },
  },
  Mutation: {
    AddOrder: (_, args, context) => createCheckout(args, context),
    cancelCheckout: (_, { orderId }, context) => cancelCheckout(orderId, context),
    deleteOldPendingOrders: async () => {
      throw new CustomError("Orders are audit records and cannot be deleted through the public API", 403);
    },
  },
};
