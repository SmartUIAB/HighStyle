"use strict";
const Order = require("../Model/orderModel");
const CustomError = require("../Utilities/CustomError");

function sessionParameters(order) {
  const metadata = { orderId: String(order._id), customerId: String(order.customer) };
  return {
    mode: "payment", payment_method_types: ["card"], customer_email: order.checkoutEmail,
    adaptive_pricing: { enabled: false },
    client_reference_id: String(order._id),
    success_url: order.checkoutSuccessUrl, cancel_url: order.checkoutCancelUrl,
    expires_at: Math.floor(order.checkoutExpiresAt.getTime() / 1000),
    line_items: order.products.map(item => ({
      price_data: { currency: order.currency, product_data: { name: [item.title, item.color, item.size].filter(Boolean).join(" · ").slice(0, 500) }, unit_amount: item.unitAmountMinor },
      quantity: item.quantity,
    })),
    metadata, payment_intent_data: { metadata },
  };
}

function assertCheckoutSession(order, checkout) {
  if (!checkout || typeof checkout !== "object" || typeof checkout.id !== "string" || !/^cs_[A-Za-z0-9_]+$/.test(checkout.id)) throw new CustomError("Payment provider returned an invalid session", 502);
  if (checkout.mode !== "payment" || !["open", "complete", "expired"].includes(checkout.status) || !["paid", "unpaid"].includes(checkout.payment_status)) throw new CustomError("Payment provider returned an invalid session state", 502);
  if (typeof checkout.livemode !== "boolean" || checkout.livemode !== (process.env.STRIPE_MODE === "live")) throw new CustomError("Payment mode mismatch", 502);
  if (checkout.amount_total !== order.amountMinor || checkout.currency !== order.currency || checkout.client_reference_id !== String(order._id)
      || checkout.metadata?.orderId !== String(order._id) || checkout.metadata?.customerId !== String(order.customer)) throw new CustomError("Payment provider response does not match this order", 502);
  if (checkout.status === "open" && !checkout.url) throw new CustomError("Payment provider returned no checkout URL", 502);
  if (checkout.url != null && (typeof checkout.url !== "string" || !checkout.url.startsWith("https://checkout.stripe.com/"))) throw new CustomError("Payment provider returned an invalid checkout URL", 502);
}

async function attachCheckoutSession(order, checkout) {
  assertCheckoutSession(order, checkout);
  const update = { checkoutSessionId: checkout.id, reservationCheckAfter: new Date(Math.min(order.reservationExpiresAt.getTime(), Date.now() + 120000)) };
  if (checkout.url) update.checkoutUrl = checkout.url;
  const result = await Order.updateOne({
    _id: order._id, inventoryStatus: "RESERVED", paymentStatus: "PENDING",
    $or: [{ checkoutSessionId: { $exists: false } }, { checkoutSessionId: checkout.id }],
  }, { $set: update });
  if (!result.matchedCount) {
    const current = await Order.findById(order._id);
    // A signed webhook can commit after another request attached this same session.
    if (current?.checkoutSessionId !== checkout.id) throw new CustomError("Checkout state changed; refresh and retry", 409);
  }
  return checkout;
}

async function findUnlinkedSession(order, stripe) {
  const created = {
    gte: Math.floor(order.inventoryReservedAt.getTime() / 1000) - 60,
    lte: Math.floor(order.checkoutExpiresAt.getTime() / 1000) + 60,
  };
  let cursor;
  // Bound work during outages. Exceeding the bound leaves stock held for review.
  for (let page = 0; page < 10; page++) {
    const response = await stripe.checkout.sessions.list({ created, limit: 100, ...(cursor ? { starting_after: cursor } : {}) });
    if (!response || !Array.isArray(response.data) || typeof response.has_more !== "boolean" || response.data.some(item => !item || typeof item !== "object")) throw new CustomError("Payment reconciliation is unavailable", 503);
    const matches = response.data.filter(item => item.client_reference_id === String(order._id) && item.metadata?.orderId === String(order._id));
    if (matches.length > 1) throw new CustomError("Multiple provider sessions require reconciliation", 503);
    if (matches.length) return attachCheckoutSession(order, matches[0]);
    if (!response.has_more) return null;
    cursor = response.data.at(-1)?.id;
    if (!cursor) break;
  }
  throw new CustomError("Provider reconciliation exceeded its bounded scan", 503);
}

async function ensureCheckoutSession(order, stripe, now = new Date()) {
  if (order.checkoutSessionId) {
    const checkout = await stripe.checkout.sessions.retrieve(order.checkoutSessionId);
    assertCheckoutSession(order, checkout);
    if (checkout.id !== order.checkoutSessionId) throw new CustomError("Payment provider returned a different checkout", 502);
    return checkout;
  }
  // Never change expires_at when retrying an idempotency key, and never create a
  // new session after its fixed creation window. Recover an uncertain response.
  if (order.checkoutExpiresAt.getTime() - now.getTime() <= 31 * 60000) {
    const existing = await findUnlinkedSession(order, stripe);
    if (existing) return existing;
    throw new CustomError("Checkout is awaiting provider reconciliation. Please retry shortly.", 503);
  }
  const current = await Order.findOneAndUpdate({ _id: order._id, inventoryStatus: "RESERVED", paymentStatus: "PENDING" },
    { $min: { checkoutCreateStartedAt: now } }, { new: true });
  if (!current) throw new CustomError("Checkout state changed; refresh and retry", 409);
  // Provider I/O deliberately happens after the stock transaction commits.
  // A timeout is ambiguous: leave the reservation intact and reuse this exact key.
  const checkout = await stripe.checkout.sessions.create(sessionParameters(order), { idempotencyKey: `highstyle-checkout-${order._id}` });
  return attachCheckoutSession(order, checkout);
}

module.exports = { ensureCheckoutSession, findUnlinkedSession, sessionParameters, assertCheckoutSession };
