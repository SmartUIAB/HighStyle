"use strict";
const { createHash } = require("node:crypto");
const mongoose = require("mongoose");
const CustomError = require("../Utilities/CustomError");
const { requireCustomer, requireOwnership, objectId } = require("../Security/access");
const { priceCart } = require("./catalogPricing");
const Cart = require("../Model/cartModel");
const Order = require("../Model/orderModel");
const { reserveInventory } = require("./inventory");
const { ensureCheckoutSession } = require("./checkoutSession");

const RESERVATION_MINUTES = 45;

function checkoutUrls(locale, base = process.env.FRONTEND_URL) {
  if (!["en", "ar", "sv", "es", "fr", "pt"].includes(locale)) throw new CustomError("Unsupported checkout language", 400);
  let url;
  try { url = new URL(base); } catch (_) { throw new CustomError("Storefront URL is not configured", 503); }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || (process.env.NODE_ENV === "production" && url.protocol !== "https:")) throw new CustomError("Invalid storefront URL configuration", 503);
  return { success_url: new URL(`/${locale}/page/order-success`, url).href, cancel_url: new URL(`/${locale}/page/account/cart`, url).href };
}

function shippingAddress(input) {
  const output = {};
  for (const key of ["street", "city", "state", "postalCode", "country"]) {
    if (typeof input?.[key] !== "string" || !input[key].trim() || input[key].length > 200) throw new CustomError("A complete shipping address is required", 400);
    output[key] = input[key].trim();
  }
  return output;
}

async function createCheckout(args, context, stripeClient) {
  const customerId = requireCustomer(context, args.customerId);
  if (process.env.PAYMENTS_ENABLED !== "true") throw new CustomError("Checkout is temporarily unavailable pending payment acceptance", 503);
  const address = shippingAddress(args.shippingAddress);
  const urls = checkoutUrls(args.locale || "en");
  const cartId = objectId(args.cartId, "Cart");
  // Reject missing/mismatched Stripe configuration before reserving any stock.
  const stripe = stripeClient || require("./stripeClient").getStripe();
  const order = await reserveCheckout({ customerId, cartId, email: context.user.email, address, urls });
  if (order.checkoutUrl && order.checkoutExpiresAt > new Date()) return checkoutResponse(order);
  const checkout = await ensureCheckoutSession(order, stripe);
  if (checkout.status && checkout.status !== "open") throw new CustomError("This checkout is no longer open. Please refresh your orders and cart.", 409);
  return { order: String(order._id), paymentIntentClientSecret: checkout.url };
}

function checkoutResponse(order) {
  return { order: String(order._id), paymentIntentClientSecret: order.checkoutUrl };
}

async function reserveCheckout({ customerId, cartId, email, address, urls }) {
  let order;
  const session = await mongoose.startSession();
  try {
    // Concurrent first requests can hit the unique activeCartKey before MongoDB
    // classifies the conflict as transient. Retry the whole transaction, never a line.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await session.withTransaction(async () => {
          const cart = await Cart.findById(cartId).session(session);
          if (!cart) throw new CustomError("Cart not found", 404);
          requireOwnership(cart.userId, customerId);
          const checkoutRequestKey = createHash("sha256").update(JSON.stringify({ customerId, cartId, version: cart.__v, address, urls })).digest("hex");
          order = await Order.findOne({ activeCartKey: cartId }).session(session);
          if (order) {
            if (order.inventoryStatus !== "RESERVED" || order.paymentStatus !== "PENDING") throw new CustomError("Checkout is being reconciled. Please retry shortly.", 409);
            if (order.checkoutRequestKey !== checkoutRequestKey) throw new CustomError("You have an unfinished checkout. Cancel it before changing the cart or delivery address.", 409);
            return;
          }
          const priced = await priceCart(cart.products.map(item => item.toObject()), { session });
          if (priced.amountMinor < 50) throw new CustomError("Order must total at least USD 0.50", 400);
          const locked = await Cart.updateOne({ _id: cart._id, userId: customerId, __v: cart.__v }, { $inc: { checkoutRevision: 1 } }, { session });
          if (locked.modifiedCount !== 1) throw new CustomError("Cart changed; refresh and retry", 409);
          const id = new mongoose.Types.ObjectId();
          const success = new URL(urls.success_url); success.searchParams.set("order_id", String(id));
          const cancel = new URL(urls.cancel_url); cancel.searchParams.set("checkout_order", String(id));
          const now = new Date();
          const expires = new Date(Math.floor(now.getTime() / 1000) * 1000 + RESERVATION_MINUTES * 60000);
          [order] = await Order.create([{
            _id: id, checkoutKey: `${checkoutRequestKey}:${id}`, checkoutRequestKey, activeCartKey: cartId,
            customer: customerId, cart: cart._id, cartVersion: cart.__v,
            products: priced.products.map(item => ({ productType: item.productType, productId: item.ProductID, quantity: item.quantity, title: item.title, unitAmountMinor: item.unitAmountMinor, totalAmountMinor: item.totalAmountMinor, color: item.color, size: item.size })),
            finalTotal: priced.totalAmount, amountMinor: priced.amountMinor, currency: "usd", shippingAddress: address,
            paymentStatus: "PENDING", orderStatus: "PENDING", inventoryStatus: "RESERVED", inventoryReservedAt: now,
            reservationExpiresAt: expires, reservationCheckAfter: new Date(now.getTime() + 60000),
            checkoutExpiresAt: expires, checkoutEmail: email, checkoutSuccessUrl: success.href, checkoutCancelUrl: cancel.href,
          }], { session });
          await reserveInventory(order, session);
        }, { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } });
        return order;
      } catch (error) {
        if (error.code !== 11000 || attempt === 2) throw error;
      }
    }
  } finally {
    await session.endSession();
  }
}

module.exports = { createCheckout, checkoutUrls, shippingAddress, RESERVATION_MINUTES };
