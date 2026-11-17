"use strict";
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "integration-tests-only-not-a-deployment-key";
process.env.PAYMENTS_ENABLED = "true";
process.env.STRIPE_MODE = "test";
process.env.FRONTEND_URL = "https://store.example";
const uri = process.env.MONGODB_TEST_URI;
if (process.env.RUN_DB_TESTS === "true" && !uri) throw new Error("MONGODB_TEST_URI is required by the integration gate");
if (uri) {
  const parsed = new URL(uri);
  if (!["127.0.0.1", "localhost"].includes(parsed.hostname) || parsed.pathname !== "/highstyle_ci") throw new Error("Refusing to reset anything except a loopback highstyle_ci test database");
}
const Company = require("../Model/companyModel");
const Customer = require("../Model/customerModel");
const User = require("../Model/userModel");
const Product = require("../Model/physicalProductModel");
const Cart = require("../Model/cartModel");
const Order = require("../Model/orderModel");
const Transaction = require("../Model/transactionModel");
const PaymentEvent = require("../Model/paymentEventModel");
const ReceiptOutbox = require("../Model/receiptOutboxModel");
const Notification = require("../Model/notificationModel");
const { authenticateUser } = require("../Utilities/authUtils");
const { createCheckout } = require("../Services/checkout");
const { applyPaymentEvent } = require("../Services/paymentSettlement");
const { dispatchReceipts } = require("../Services/receiptOutbox");
const resolvers = require("../GraphQL/Resolver");
const dbtest = (name, fn) => test(name, { skip: !uri, timeout: 30000 }, fn);
let store;
let otherStore;
let product;
let admin;
let otherAdmin;
let sequence = 0;
const address = { street: "Test Street", city: "Test City", state: "Test State", postalCode: "12345", country: "SE" };

before(async () => {
  if (!uri) return;
  await mongoose.connect(uri, { autoCreate: false, autoIndex: false, serverSelectionTimeoutMS: 10000 });
  await mongoose.connection.dropDatabase();
  for (const Model of Object.values(mongoose.models)) { await Model.createCollection(); await Model.createIndexes(); }
  store = await Company.create({ name: "CI store A" });
  otherStore = await Company.create({ name: "CI store B" });
  product = await Product.create({ title: "Catalog <item>", SKU: "CI-ITEM", price: 12.34, discount: 0, stockQuantity: 100, company: store._id, status: "Available", images: [] });
  const password = await bcrypt.hash("ci-only-long-password", 10);
  const makeAdmin = async (email, company) => {
    const user = await User.create({ email, company, firstname: "CI", lastname: "Admin", password, role: "Admin", permissions: [] });
    return authenticateUser(jwt.sign({ userId: String(user._id) }, process.env.JWT_SECRET, { expiresIn: "1h" }));
  };
  admin = await makeAdmin("admin-a@example.invalid", store._id);
  otherAdmin = await makeAdmin("admin-b@example.invalid", otherStore._id);
  process.env.PLATFORM_ADMIN_IDS = admin.userId;
});
after(async () => { if (uri) await mongoose.disconnect(); });

async function makeCustomer() {
  const user = await Customer.create({ firstname: "CI", lastname: "Customer", email: `customer-${++sequence}@example.invalid`, password: "not-used-for-login-in-this-fixture" });
  return authenticateUser(jwt.sign({ customerId: String(user._id) }, process.env.JWT_SECRET, { expiresIn: "1h" }));
}
async function makeCart(context, quantity = 2) {
  return resolvers.Mutation.createCart(null, { input: { userId: context.userId, totalAmount: 0.01, products: [{ ProductID: String(product._id), title: "Forged", price: 0.01, totalAmount: 0.01, quantity }] } }, context);
}
async function fixture() {
  const context = await makeCustomer();
  const cart = await makeCart(context);
  const calls = [];
  const stripe = { checkout: { sessions: { create: async (params, options) => {
    calls.push({ params, options });
    return { id: `cs_ci_${cart._id}`, url: `https://checkout.stripe.com/c/pay/cs_ci_${cart._id}` };
  } } } };
  const args = { customerId: context.userId, cartId: String(cart._id), shippingAddress: address, locale: "en" };
  const result = await createCheckout(args, context, stripe);
  const order = await Order.findById(result.order);
  const event = { id: `evt_ci_${++sequence}`, type: "checkout.session.completed", livemode: false, data: { object: {
    id: order.checkoutSessionId, amount_total: order.amountMinor, currency: order.currency, payment_status: "paid", payment_intent: `pi_ci_${order._id}`,
    metadata: { orderId: String(order._id), customerId: context.userId, userEmail: "attacker@example.invalid" },
  } } };
  return { context, cart, calls, stripe, args, result, order, event };
}

// Each test uses actual MongoDB collections, indexes and multi-document transactions.
dbtest("customer isolation protects cart, orders, favourites and reviews", async () => {
  const a = await makeCustomer(); const b = await makeCustomer(); const cart = await makeCart(a);
  assert.equal(cart.totalAmount, 24.68);
  assert.equal(cart.products[0].title, product.title);
  const forbidden = [
    () => resolvers.Query.getCart(null, { userId: a.userId }, b),
    () => resolvers.Query.GetMyOrder(null, { customerId: a.userId }, b),
    () => resolvers.Mutation.updateCart(null, { cartId: String(cart._id), productId: String(cart.products[0]._id), newQuantity: 1 }, b),
    () => resolvers.Mutation.deleteCart(null, { cartId: String(cart._id), productId: String(cart.products[0]._id) }, b),
    () => resolvers.Mutation.addToFavourite(null, { userId: a.userId, productId: String(product._id), productType: "PhysicalProduct" }, b),
    () => resolvers.Mutation.writeReview(null, { userId: a.userId, productId: String(product._id), rating: 5, comment: "Forged" }, b),
  ];
  for (const action of forbidden) await assert.rejects(action(), error => error.statusCode === 403);
  assert.equal((await Cart.findById(cart._id)).totalAmount, 24.68);
});
dbtest("company-scoped reads and writes prevent cross-tenant user and product access", async () => {
  await User.create({ firstname: "Worker", lastname: "A", email: "worker-a@example.invalid", password: "fixture", company: store._id, role: "User" });
  await User.create({ firstname: "Worker", lastname: "B", email: "worker-b@example.invalid", password: "fixture", company: otherStore._id, role: "User" });
  const users = await resolvers.Query.userlist(null, {}, admin);
  assert.equal(users.length, 1);
  assert.equal(users[0].email, "worker-a@example.invalid");
  await assert.rejects(resolvers.Query.userById(null, { userId: admin.userId }, otherAdmin), error => error.statusCode === 404);
  await assert.rejects(resolvers.Mutation.updatePhysicalProduct(null, { id: String(product._id), input: { price: 0.01 } }, otherAdmin), error => error.statusCode === 404);
  assert.equal((await Product.findById(product._id)).price, 12.34);
});
dbtest("checkout is server-priced, snapshots the order, and reuses the same idempotent session", async () => {
  const f = await fixture();
  assert.equal(f.order.amountMinor, 2468);
  assert.equal(f.order.products[0].unitAmountMinor, 1234);
  assert.equal(f.calls[0].params.line_items[0].price_data.unit_amount, 2468);
  assert.equal(f.calls[0].params.success_url, "https://store.example/en/page/order-success");
  assert.equal(f.calls[0].options.idempotencyKey, `highstyle-checkout-${f.order._id}`);
  assert.deepEqual(await createCheckout(f.args, f.context, f.stripe), f.result);
  assert.equal(f.calls.length, 1);
});
dbtest("checkout reprices legacy tampered cart totals directly from the catalog", async () => {
  const context = await makeCustomer(); const cart = await makeCart(context);
  await Cart.updateOne({ _id: cart._id }, { $set: { totalAmount: 0.01, "products.0.price": 0.01, "products.0.totalAmount": 0.01 } });
  let amount;
  await createCheckout({ customerId: context.userId, cartId: String(cart._id), shippingAddress: address }, context, { checkout: { sessions: { create: async params => { amount = params.line_items[0].price_data.unit_amount; return { id: `cs_ci_${cart._id}`, url: `https://checkout.stripe.com/c/pay/${cart._id}` }; } } } });
  assert.equal(amount, 2468);
});
dbtest("payment activation is fail-closed and creates no order when disabled", async () => {
  const context = await makeCustomer(); const cart = await makeCart(context); const count = await Order.countDocuments();
  process.env.PAYMENTS_ENABLED = "false";
  try { await assert.rejects(createCheckout({ customerId: context.userId, cartId: String(cart._id), shippingAddress: address }, context), error => error.statusCode === 503); }
  finally { process.env.PAYMENTS_ENABLED = "true"; }
  assert.equal(await Order.countDocuments(), count);
});
dbtest("signed events still must match amount, currency, session, owner and mode", async () => {
  const f = await fixture();
  for (const change of [{ amount_total: 1 }, { currency: "eur" }, { id: "cs_unrelated" }, { metadata: { orderId: String(f.order._id), customerId: "111111111111111111111111" } }]) {
    const event = { ...f.event, id: `evt_bad_${++sequence}`, data: { object: { ...f.event.data.object, ...change } } };
    await assert.rejects(applyPaymentEvent(event), error => error.statusCode === 400);
    assert.equal(await PaymentEvent.countDocuments({ _id: event.id }), 0);
  }
  await assert.rejects(applyPaymentEvent({ ...f.event, livemode: true }), error => error.statusCode === 400);
  assert.equal((await Order.findById(f.order._id)).paymentStatus, "PENDING");
});
dbtest("settlement, transaction, event and receipt commit atomically and duplicates are harmless", async () => {
  const f = await fixture();
  assert.deepEqual(await applyPaymentEvent(f.event), { processed: true });
  assert.deepEqual(await applyPaymentEvent(f.event), { duplicate: true });
  await applyPaymentEvent({ ...f.event, id: `evt_semantic_${++sequence}` });
  const order = await Order.findById(f.order._id);
  assert.equal(order.paymentStatus, "PAID");
  assert.equal(order.orderStatus, "PENDING");
  assert.equal(await Transaction.countDocuments({ order: order._id }), 1);
  assert.equal(await ReceiptOutbox.countDocuments({ order: order._id }), 1);
  assert.equal(await Notification.countDocuments({ message: `Payment received for order ${order._id}.` }), 1);
  assert.equal(await Cart.countDocuments({ _id: f.cart._id }), 0);
});
dbtest("concurrent duplicate deliveries produce exactly one payment record", async () => {
  const f = await fixture();
  await Promise.all(Array.from({ length: 5 }, () => applyPaymentEvent(f.event)));
  assert.equal(await Transaction.countDocuments({ order: f.order._id }), 1);
  assert.equal(await PaymentEvent.countDocuments({ _id: f.event.id }), 1);
  assert.equal(await ReceiptOutbox.countDocuments({ order: f.order._id }), 1);
});
dbtest("an internal failure rolls back the entire settlement and a retry succeeds", async t => {
  const f = await fixture();
  t.mock.method(ReceiptOutbox, "updateOne", async () => { throw new Error("simulated outbox failure"); });
  await assert.rejects(applyPaymentEvent(f.event), /outbox failure/);
  t.mock.restoreAll();
  assert.equal((await Order.findById(f.order._id)).paymentStatus, "PENDING");
  assert.equal(await Transaction.countDocuments({ order: f.order._id }), 0);
  assert.equal(await PaymentEvent.countDocuments({ _id: f.event.id }), 0);
  assert.equal(await Cart.countDocuments({ _id: f.cart._id }), 1);
  await applyPaymentEvent(f.event);
  assert.equal((await Order.findById(f.order._id)).paymentStatus, "PAID");
});
dbtest("settlement never deletes a cart edited after its checkout snapshot", async () => {
  const f = await fixture();
  await makeCart(f.context, 1);
  await applyPaymentEvent(f.event);
  const cart = await Cart.findById(f.cart._id);
  assert.ok(cart);
  assert.equal(cart.products.length, 2);
});
dbtest("late failure events cannot downgrade a successful payment", async () => {
  const f = await fixture(); await applyPaymentEvent(f.event);
  await applyPaymentEvent({ ...f.event, id: `evt_failed_${++sequence}`, type: "checkout.session.async_payment_failed" });
  assert.equal((await Order.findById(f.order._id)).paymentStatus, "PAID");
});
dbtest("partial/full refunds are monotonic even when events arrive out of order", async () => {
  const f = await fixture(); await applyPaymentEvent(f.event);
  const refund = amount => ({ id: `evt_refund_${++sequence}`, type: "charge.refunded", livemode: false, data: { object: { id: `ch_ci_${f.order._id}`, payment_intent: f.event.data.object.payment_intent, amount: f.order.amountMinor, amount_refunded: amount, currency: "usd" } } });
  await applyPaymentEvent(refund(500)); await applyPaymentEvent(refund(100));
  let order = await Order.findById(f.order._id);
  assert.equal(order.refundedAmountMinor, 500); assert.equal(order.paymentStatus, "PARTIALLY_REFUNDED");
  await applyPaymentEvent(refund(f.order.amountMinor));
  order = await Order.findById(f.order._id);
  assert.equal(order.paymentStatus, "REFUNDED");
  assert.equal((await Transaction.findOne({ order: order._id })).transactionStatus, "REFUNDED");
});
dbtest("receipt failures are retryable without retrying or duplicating the payment", async () => {
  const f = await fixture(); await applyPaymentEvent(f.event);
  // Isolate this fixture's work from receipt tasks created by other tests.
  await ReceiptOutbox.updateMany({ _id: { $ne: String(f.order._id) } }, { $set: { status: "sent" } });
  await dispatchReceipts({ sendMail: async () => { throw Object.assign(new Error("simulated SMTP failure"), { code: "EAUTH" }); } });
  let task = await ReceiptOutbox.findById(String(f.order._id));
  assert.equal(task.status, "pending"); assert.equal(task.attempts, 1);
  await ReceiptOutbox.updateOne({ _id: task._id }, { $set: { nextAttemptAt: new Date(0) } });
  const messages = [];
  assert.equal(await dispatchReceipts({ sendMail: async message => { messages.push(message); } }), 1);
  assert.equal(messages[0].to, f.context.user.email);
  assert.ok(messages[0].html.includes("Catalog &lt;item&gt;"));
  assert.equal((await ReceiptOutbox.findById(task._id)).status, "sent");
  assert.equal(await Transaction.countDocuments({ order: f.order._id }), 1);
});
dbtest("administrator status APIs cannot fabricate payments or bypass the platform allowlist", async () => {
  const f = await fixture();
  await assert.rejects(resolvers.Mutation.updateOrderStatus(null, { orderId: String(f.order._id), paymentStatus: "PAID", orderStatus: "SHIPPED" }, admin), error => error.statusCode === 403);
  await assert.rejects(resolvers.Query.getAllOrders(null, {}, otherAdmin), error => error.statusCode === 403);
  await assert.rejects(resolvers.Mutation.updateTransactionStatus(null, { transactionId: "111111111111111111111111", transactionStatus: "SUCCESSFUL" }, admin), error => error.statusCode === 403);
});

dbtest("password reset is single-use under concurrency and revokes old sessions", async () => {
  const context = await makeCustomer();
  const token = "a".repeat(64);
  const digest = require("node:crypto").createHash("sha256").update(token).digest("hex");
  const oldSession = jwt.sign({ customerId: context.userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
  await Customer.updateOne({ _id: context.userId }, { $set: { resetPasswordToken: digest, resetPasswordExpire: Date.now() + 60000 } });
  const attempts = await Promise.allSettled(["a-new-long-password", "a-second-long-password"].map(newPassword => resolvers.Mutation.resetPassword(null, { token, newPassword }, { ip: "127.0.0.1" })));
  assert.equal(attempts.filter(item => item.status === "fulfilled").length, 1);
  assert.equal(attempts.filter(item => item.status === "rejected").length, 1);
  assert.equal((await authenticateUser(oldSession)).userId, null);
  const user = await Customer.findById(context.userId);
  assert.equal(user.authVersion, 1);
  assert.equal(user.resetPasswordToken, undefined);
});
