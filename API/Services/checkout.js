"use strict";
const { createHash } = require("node:crypto");
const CustomError = require("../Utilities/CustomError");
const { requireCustomer, requireOwnership, objectId } = require("../Security/access");
const { priceCart } = require("./catalogPricing");
const Cart = require("../Model/cartModel");
const Order = require("../Model/orderModel");

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
  const cart = await Cart.findById(objectId(args.cartId, "Cart"));
  if (!cart) throw new CustomError("Cart not found", 404);
  requireOwnership(cart.userId, customerId);
  const priced = await priceCart(cart.products.map(item => item.toObject()));
  if (priced.amountMinor < 50) throw new CustomError("Order must total at least USD 0.50", 400);
  const address = shippingAddress(args.shippingAddress);
  const urls = checkoutUrls(args.locale || "en");
  const products = priced.products.map(item => ({ productType: item.productType, productId: item.ProductID, quantity: item.quantity, title: item.title, unitAmountMinor: item.unitAmountMinor, totalAmountMinor: item.totalAmountMinor }));
  const checkoutKey = createHash("sha256").update(JSON.stringify({ customerId, cart: String(cart._id), version: cart.__v, lines: priced.products, address, urls })).digest("hex");
  let order;
  try {
    order = await Order.findOneAndUpdate({ checkoutKey }, { $setOnInsert: {
      checkoutKey, customer: customerId, cart: cart._id, cartVersion: cart.__v,
      products, finalTotal: priced.totalAmount, amountMinor: priced.amountMinor,
      currency: "usd", shippingAddress: address, paymentStatus: "PENDING", orderStatus: "PENDING",
    } }, { new: true, upsert: true, runValidators: true });
  } catch (error) {
    if (error.code !== 11000) throw error;
    order = await Order.findOne({ checkoutKey });
  }
  if (!order || order.paymentStatus !== "PENDING") throw new CustomError("This checkout was already processed; refresh your cart", 409);
  if (order.checkoutUrl) return { order: String(order._id), paymentIntentClientSecret: order.checkoutUrl };
  const stripe = stripeClient || require("./stripeClient").getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment", payment_method_types: ["card"], customer_email: context.user.email,
    ...urls,
    line_items: [{ price_data: { currency: "usd", product_data: { name: `HighStyle order ${order._id}` }, unit_amount: priced.amountMinor }, quantity: 1 }],
    metadata: { orderId: String(order._id), customerId },
    payment_intent_data: { metadata: { orderId: String(order._id), customerId } },
  }, { idempotencyKey: `highstyle-checkout-${order._id}` });
  if (!session.id || !session.url || !session.url.startsWith("https://checkout.stripe.com/")) throw new CustomError("Payment provider returned an invalid session", 502);
  await Order.updateOne({ _id: order._id }, { $set: { checkoutSessionId: session.id, checkoutUrl: session.url } });
  return { order: String(order._id), paymentIntentClientSecret: session.url };
}

module.exports = { createCheckout, checkoutUrls, shippingAddress };
