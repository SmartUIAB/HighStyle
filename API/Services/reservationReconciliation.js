"use strict";
const mongoose = require("mongoose");
const Order = require("../Model/orderModel");
const CustomError = require("../Utilities/CustomError");
const { requireCustomer, requireOwnership, objectId } = require("../Security/access");
const { ensureCheckoutSession, findUnlinkedSession, assertCheckoutSession } = require("./checkoutSession");
const { releaseInventory } = require("./inventory");
const { applyPaymentEvent } = require("./paymentSettlement");

async function releaseUncreatedCheckout(orderId, now) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session);
      if (!order || order.inventoryStatus !== "RESERVED" || order.paymentStatus !== "PENDING" || order.checkoutSessionId) return;
      // All requests use the same immutable expires_at. Stripe cannot create a
      // session after this time, even if an earlier network request was delayed.
      if (order.checkoutExpiresAt.getTime() + 120000 > now.getTime()) return;
      await releaseInventory(order, session, "provider_confirmed_no_session_after_expiry");
      order.paymentStatus = "FAILED";
      order.orderStatus = "CANCELED";
      await order.save({ session });
    }, { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } });
  } finally { await session.endSession(); }
}

async function applyProviderSnapshot(checkout) {
  const paid = checkout.status === "complete" && checkout.payment_status === "paid";
  const expired = checkout.status === "expired" && checkout.payment_status !== "paid";
  if (!paid && !expired) return false;
  // This internal event is derived from an authenticated Stripe API response.
  // Its deterministic ID shares the same transactional idempotency ledger.
  await applyPaymentEvent({
    id: `evt_reconcile_${paid ? "paid" : "expired"}_${checkout.id}`,
    type: paid ? "checkout.session.completed" : "checkout.session.expired",
    livemode: checkout.livemode,
    data: { object: checkout },
  });
  return true;
}

async function reconcileCheckout(order, stripe, { cancel = false, now = new Date() } = {}) {
  if (order.inventoryStatus !== "RESERVED" || order.paymentStatus !== "PENDING") return;
  let checkout;
  if (!order.checkoutSessionId && order.checkoutExpiresAt.getTime() - now.getTime() <= 31 * 60000) {
    checkout = await findUnlinkedSession(order, stripe);
    // An exhaustive authenticated list returning no matching session, plus the
    // closed creation window, is required before an unlinked hold is released.
    if (!checkout) { await releaseUncreatedCheckout(order._id, now); return; }
  } else {
    checkout = await ensureCheckoutSession(order, stripe, now);
  }
  if (await applyProviderSnapshot(checkout)) return;
  if (checkout.status === "open" && (cancel || order.reservationExpiresAt <= now)) {
    try { checkout = await stripe.checkout.sessions.expire(checkout.id); }
    catch (error) {
      // Expiry may lose a race to a completed payment. Retrieve the authoritative
      // state; never infer cancellation from an HTTP error or a local timer.
      checkout = await stripe.checkout.sessions.retrieve(checkout.id);
    }
    assertCheckoutSession(order, checkout);
    await applyProviderSnapshot(checkout);
  }
}

async function cancelCheckout(orderId, context, stripeClient) {
  const customerId = requireCustomer(context);
  const order = await Order.findById(objectId(orderId, "Order"));
  if (!order) throw new CustomError("Order not found", 404);
  requireOwnership(order.customer, customerId);
  if (order.inventoryStatus === "RELEASED") return order;
  if (order.paymentStatus !== "PENDING") throw new CustomError("A paid order cannot be canceled from checkout", 409);
  const stripe = stripeClient || require("./stripeClient").getStripe();
  await reconcileCheckout(order, stripe, { cancel: true });
  const current = await Order.findById(order._id);
  if (current.inventoryStatus === "RESERVED") throw new CustomError("The payment provider is still processing this checkout. Your stock remains reserved; please retry.", 409);
  if (current.paymentStatus !== "FAILED") throw new CustomError("Payment completed before cancellation. Please review your order.", 409);
  return current;
}

async function reconcileReservations({ stripeClient, now = new Date(), limit = 25 } = {}) {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) throw new Error("Invalid reservation reconciliation batch size");
  const stripe = stripeClient || require("./stripeClient").getStripe();
  const orders = await Order.find({ inventoryStatus: "RESERVED", paymentStatus: "PENDING", reservationCheckAfter: { $lte: now } })
    .sort({ reservationCheckAfter: 1 }).limit(limit);
  const result = { checked: orders.length, failed: 0 };
  for (const order of orders) {
    try {
      await reconcileCheckout(order, stripe, { now });
      await Order.updateOne({ _id: order._id, inventoryStatus: "RESERVED" }, {
        $set: { reservationCheckedAt: now, reservationCheckAfter: new Date(now.getTime() + 60000) }, $unset: { reservationError: 1 },
      });
    } catch (_) {
      result.failed++;
      // Do not persist provider exception text: it can contain request details.
      await Order.updateOne({ _id: order._id, inventoryStatus: "RESERVED" }, {
        $set: { reservationCheckedAt: now, reservationCheckAfter: new Date(now.getTime() + 60000), reservationError: "PROVIDER_RECONCILIATION_PENDING" },
      });
    }
  }
  return result;
}

module.exports = { cancelCheckout, reconcileCheckout, reconcileReservations };
