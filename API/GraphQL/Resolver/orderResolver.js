"use strict";
const Order = require("../../Model/orderModel");
const CustomError = require("../../Utilities/CustomError");
const { requireCustomer, objectId } = require("../../Security/access");
const { createCheckout } = require("../../Services/checkout");
const { cancelCheckout } = require("../../Services/reservationReconciliation");

module.exports = {
  Query: {
    GetMyOrder: async (_, { customerId, orderId }, context) => {
      requireCustomer(context, customerId);
      const filter = { customer: customerId };
      if (orderId != null) filter._id = objectId(orderId, "Order");
      return Order.find(filter).sort({ createdAt: -1 }).limit(orderId != null ? 1 : 100);
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
