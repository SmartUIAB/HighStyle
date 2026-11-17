"use strict";
const mongoose = require("mongoose");
const CustomError = require("../Utilities/CustomError");
const { objectId } = require("../Security/access");
const Order = require("../Model/orderModel");
const Cart = require("../Model/cartModel");
const Transaction = require("../Model/transactionModel");
const PaymentEvent = require("../Model/paymentEventModel");
const ReceiptOutbox = require("../Model/receiptOutboxModel");
const Notification = require("../Model/notificationModel");
const SUPPORTED_EVENTS = new Set(["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "checkout.session.expired", "charge.refunded"]);

async function applyPaymentEvent(event) {
  if (!SUPPORTED_EVENTS.has(event?.type)) return { ignored: true };
  if (typeof event.id !== "string" || !/^evt_[A-Za-z0-9_]+$/.test(event.id) || !event.data?.object) throw new CustomError("Invalid payment event", 400);
  if (event.livemode !== (process.env.STRIPE_MODE === "live")) throw new CustomError("Payment mode mismatch", 400);
  let result;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      if (await PaymentEvent.findById(event.id).session(session)) { result = { duplicate: true }; return; }
      const payload = event.data.object;
      const refund = event.type === "charge.refunded";
      let order;
      if (refund) {
        const intent = typeof payload.payment_intent === "string" ? payload.payment_intent : payload.payment_intent?.id;
        if (!intent) throw new CustomError("Missing payment reference", 400);
        order = await Order.findOne({ paymentIntentId: intent }).session(session);
      } else {
        order = await Order.findById(objectId(payload.metadata?.orderId, "Order")).session(session);
      }
      // Retry unlinked events: a valid event can race the checkout-session persistence.
      if (!order) throw new CustomError("Payment reconciliation pending", 503);
      if (!Number.isSafeInteger(order.amountMinor) || order.amountMinor < 50 || payload.currency !== order.currency) throw new CustomError("Payment amount/currency mismatch", 400);
      if (refund) {
        if (payload.amount !== order.amountMinor || !Number.isSafeInteger(payload.amount_refunded) || payload.amount_refunded <= 0 || payload.amount_refunded > order.amountMinor) throw new CustomError("Invalid refund amount", 400);
        const refunded = Math.max(order.refundedAmountMinor || 0, payload.amount_refunded);
        order.refundedAmountMinor = refunded;
        order.paymentStatus = refunded === order.amountMinor ? "REFUNDED" : "PARTIALLY_REFUNDED";
        await Transaction.updateOne({ order: order._id }, { $set: { transactionStatus: order.paymentStatus } }, { session, runValidators: true });
        await order.save({ session });
      } else {
        if (!order.checkoutSessionId) throw new CustomError("Payment reconciliation pending", 503);
        if (payload.id !== order.checkoutSessionId || payload.amount_total !== order.amountMinor || String(payload.metadata?.customerId) !== String(order.customer)) throw new CustomError("Payment does not match checkout", 400);
        const paidEvent = event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded";
        if (paidEvent && payload.payment_status === "paid" && !["PAID", "REFUNDED", "PARTIALLY_REFUNDED"].includes(order.paymentStatus)) {
          const intent = typeof payload.payment_intent === "string" ? payload.payment_intent : payload.payment_intent?.id;
          if (!intent) throw new CustomError("Missing payment intent", 400);
          const transaction = await Transaction.findOneAndUpdate({ order: order._id }, { $setOnInsert: {
            order: order._id, user: order.customer, transactionAmount: order.amountMinor / 100,
            transactionStatus: "SUCCESSFUL", paymentGateway: "Stripe", transactionId: intent,
          } }, { session, new: true, upsert: true, runValidators: true });
          order.paymentStatus = "PAID";
          order.paymentIntentId = intent;
          order.transaction = transaction._id;
          // Payment completion never asserts physical shipment.
          await order.save({ session });
          if (Number.isSafeInteger(order.cartVersion)) await Cart.deleteOne({ _id: order.cart, userId: order.customer, __v: order.cartVersion }, { session });
          await ReceiptOutbox.updateOne({ _id: String(order._id) }, { $setOnInsert: { order: order._id, status: "pending", attempts: 0, nextAttemptAt: new Date() } }, { session, upsert: true });
          await Notification.create([{ message: `Payment received for order ${order._id}.`, isNotified: true }], { session });
        } else if (!paidEvent && order.paymentStatus === "PENDING") {
          order.paymentStatus = "FAILED";
          if (order.orderStatus === "PENDING") order.orderStatus = "CANCELED";
          await order.save({ session });
        }
      }
      await PaymentEvent.create([{ _id: event.id, type: event.type, order: order._id }], { session });
      result = { processed: true };
    });
    return result;
  } catch (error) {
    if (error.code === 11000 && await PaymentEvent.exists({ _id: event.id })) return { duplicate: true };
    throw error;
  } finally {
    await session.endSession();
  }
}

module.exports = { applyPaymentEvent, SUPPORTED_EVENTS };
