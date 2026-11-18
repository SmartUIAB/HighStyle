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
const Permission = require("../Model/permissionModel");
const { authenticateUser } = require("../Utilities/authUtils");
const { createCheckout } = require("../Services/checkout");
const { applyPaymentEvent } = require("../Services/paymentSettlement");
const { cancelCheckout, reconcileReservations } = require("../Services/reservationReconciliation");
const { availableQuantity } = require("../Services/inventory");
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
    return { id: `cs_ci_${cart._id}`, url: `https://checkout.stripe.com/c/pay/cs_ci_${cart._id}`, status: "open", payment_status: "unpaid", livemode: false, mode: "payment", amount_total: params.line_items.reduce((sum, item) => sum + item.price_data.unit_amount * item.quantity, 0), currency: "usd", client_reference_id: params.client_reference_id, metadata: params.metadata };
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
  assert.equal(f.calls[0].params.line_items[0].price_data.unit_amount, 1234);
  assert.equal(f.calls[0].params.line_items[0].quantity, 2);
  assert.equal(f.calls[0].params.success_url, `https://store.example/en/page/order-success?order_id=${f.order._id}`);
  assert.equal(f.calls[0].options.idempotencyKey, `highstyle-checkout-${f.order._id}`);
  assert.deepEqual(await createCheckout(f.args, f.context, f.stripe), f.result);
  assert.equal(f.calls.length, 1);
});
dbtest("checkout reprices legacy tampered cart totals directly from the catalog", async () => {
  const context = await makeCustomer(); const cart = await makeCart(context);
  await Cart.updateOne({ _id: cart._id }, { $set: { totalAmount: 0.01, "products.0.price": 0.01, "products.0.totalAmount": 0.01 } });
  let amount;
  await createCheckout({ customerId: context.userId, cartId: String(cart._id), shippingAddress: address }, context, { checkout: { sessions: { create: async params => { amount = params.line_items.reduce((sum, item) => sum + item.price_data.unit_amount * item.quantity, 0); return { id: `cs_ci_${cart._id}`, url: `https://checkout.stripe.com/c/pay/${cart._id}`, status: "open", payment_status: "unpaid", livemode: false, mode: "payment", amount_total: amount, currency: "usd", client_reference_id: params.client_reference_id, metadata: params.metadata }; } } } });
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
  const before = await Product.findById(product._id);
  t.mock.method(ReceiptOutbox, "updateOne", async () => { throw new Error("simulated outbox failure"); });
  await assert.rejects(applyPaymentEvent(f.event), /outbox failure/);
  t.mock.restoreAll();
  assert.equal((await Order.findById(f.order._id)).paymentStatus, "PENDING");
  assert.equal(await Transaction.countDocuments({ order: f.order._id }), 0);
  assert.equal(await PaymentEvent.countDocuments({ _id: f.event.id }), 0);
  assert.equal(await Cart.countDocuments({ _id: f.cart._id }), 1);
  const after = await Product.findById(product._id);
  assert.equal(after.stockQuantity, before.stockQuantity);
  assert.equal(after.reservedQuantity, before.reservedQuantity);
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
  const onHandAfterSale = (await Product.findById(product._id)).stockQuantity;
  const refund = amount => ({ id: `evt_refund_${++sequence}`, type: "charge.refunded", livemode: false, data: { object: { id: `ch_ci_${f.order._id}`, payment_intent: f.event.data.object.payment_intent, amount: f.order.amountMinor, amount_refunded: amount, currency: "usd" } } });
  await applyPaymentEvent(refund(500)); await applyPaymentEvent(refund(100));
  let order = await Order.findById(f.order._id);
  assert.equal(order.refundedAmountMinor, 500); assert.equal(order.paymentStatus, "PARTIALLY_REFUNDED");
  await applyPaymentEvent(refund(f.order.amountMinor));
  order = await Order.findById(f.order._id);
  assert.equal(order.paymentStatus, "REFUNDED");
  assert.equal((await Transaction.findOne({ order: order._id })).transactionStatus, "REFUNDED");
  assert.equal((await Product.findById(product._id)).stockQuantity, onHandAfterSale, "A refund is not proof that physical merchandise was returned");
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

function fakeStripe() {
  const sessions = new Map();
  const calls = [];
  const client = { checkout: { sessions: {
    create: async (params, options) => {
      calls.push({ params: structuredClone(params), options: { ...options } });
      const id = `cs_test_${params.metadata.orderId}`;
      if (!sessions.has(id)) sessions.set(id, {
        id, url: `https://checkout.stripe.com/c/pay/${id}`, status: "open", payment_status: "unpaid", livemode: false, mode: "payment",
        amount_total: params.line_items.reduce((sum, item) => sum + item.price_data.unit_amount * item.quantity, 0),
        currency: params.line_items[0].price_data.currency, metadata: { ...params.metadata },
        client_reference_id: params.client_reference_id, expires_at: params.expires_at,
      });
      return structuredClone(sessions.get(id));
    },
    retrieve: async id => structuredClone(sessions.get(id)),
    expire: async id => {
      const item = sessions.get(id);
      if (item.status !== "open") throw new Error("Session is no longer open");
      item.status = "expired";
      item.url = null;
      return structuredClone(item);
    },
    list: async () => ({ data: [...sessions.values()].map(item => structuredClone(item)), has_more: false }),
  } } };
  return { client, calls, sessions };
}

async function inventoryProduct(stock = 5, input = {}) {
  return Product.create({ title: `Inventory item ${++sequence}`, SKU: `INVENTORY-${sequence}`, price: 10, stockQuantity: stock, company: store._id, status: "Available", ...input });
}
async function inventoryCart(lines, context) {
  context ||= await makeCustomer();
  const cart = await resolvers.Mutation.createCart(null, { input: { userId: context.userId, products: lines.map(line => ({ ProductID: String(line.product._id), quantity: line.quantity || 1, color: line.color, size: line.size })) } }, context);
  return { context, cart, args: { customerId: context.userId, cartId: String(cart._id), shippingAddress: address, locale: "en" } };
}
async function inventoryFixture(stock = 5, quantity = 2) {
  const item = await inventoryProduct(stock);
  const f = await inventoryCart([{ product: item, quantity }]);
  const provider = fakeStripe();
  const result = await createCheckout(f.args, f.context, provider.client);
  const order = await Order.findById(result.order);
  return { ...f, item, provider, result, order };
}
function paidInventoryEvent(f, id = `evt_inventory_${++sequence}`) {
  const checkout = structuredClone(f.provider.sessions.get(f.order.checkoutSessionId));
  Object.assign(checkout, { status: "complete", payment_status: "paid", payment_intent: `pi_inventory_${f.order._id}` });
  return { id, type: "checkout.session.completed", livemode: false, data: { object: checkout } };
}

dbtest("simultaneous buyers cannot reserve or sell more units than exist", async () => {
  const item = await inventoryProduct(3);
  const carts = await Promise.all(Array.from({ length: 10 }, () => inventoryCart([{ product: item }])));
  const provider = fakeStripe();
  const attempts = await Promise.allSettled(carts.map(f => createCheckout(f.args, f.context, provider.client)));
  const accepted = attempts.filter(attempt => attempt.status === "fulfilled");
  assert.equal(accepted.length, 3);
  assert.equal(attempts.filter(attempt => attempt.status === "rejected" && attempt.reason.statusCode === 409).length, 7);
  let row = await Product.findById(item._id);
  assert.equal(row.stockQuantity, 3);
  assert.equal(row.reservedQuantity, 3);
  assert.equal(availableQuantity(row), 0);
  await Promise.all(accepted.map(async attempt => {
    const order = await Order.findById(attempt.value.order);
    await applyPaymentEvent(paidInventoryEvent({ provider, order }));
  }));
  row = await Product.findById(item._id);
  assert.equal(row.stockQuantity, 0);
  assert.equal(row.reservedQuantity, 0);
  assert.equal(await Order.countDocuments({ "products.productId": item._id, paymentStatus: "PAID", inventoryStatus: "COMMITTED" }), 3);
});

dbtest("concurrent duplicate checkout requests hold stock once and use one provider key", async () => {
  const item = await inventoryProduct(1);
  const f = await inventoryCart([{ product: item }]);
  const provider = fakeStripe();
  const attempts = await Promise.all(Array.from({ length: 8 }, () => createCheckout(f.args, f.context, provider.client)));
  assert.equal(new Set(attempts.map(result => result.order)).size, 1);
  assert.equal(provider.sessions.size, 1);
  assert.equal(new Set(provider.calls.map(call => call.options.idempotencyKey)).size, 1);
  assert.equal((await Product.findById(item._id)).reservedQuantity, 1);
  assert.equal(await Order.countDocuments({ cart: f.cart._id }), 1);
  assert.deepEqual(await createCheckout(f.args, f.context, provider.client), attempts[0], "A customer can resume their own hold even when public availability is zero");
});

dbtest("failure reserving a later product rolls back every line and the order", async t => {
  const a = await inventoryProduct(1); const b = await inventoryProduct(1);
  const f = await inventoryCart([{ product: a }, { product: b }]);
  const provider = fakeStripe();
  const original = Product.updateOne.bind(Product);
  let writes = 0;
  t.mock.method(Product, "updateOne", (...args) => {
    if (args[1].$inc?.reservedQuantity > 0 && ++writes === 2) throw new Error("simulated second reservation failure");
    return original(...args);
  });
  await assert.rejects(createCheckout(f.args, f.context, provider.client), /second reservation failure/);
  t.mock.restoreAll();
  assert.equal((await Product.findById(a._id)).reservedQuantity, 0);
  assert.equal((await Product.findById(b._id)).reservedQuantity, 0);
  assert.equal(await Order.countDocuments({ cart: f.cart._id }), 0);
  assert.equal(provider.calls.length, 0);
  await createCheckout(f.args, f.context, provider.client);
  assert.equal((await Product.findById(a._id)).reservedQuantity, 1);
  assert.equal((await Product.findById(b._id)).reservedQuantity, 1);
});

dbtest("variant lines reserve their combined physical quantity and settle once", async () => {
  const item = await inventoryProduct(5, { colors: ["Blue", "Black"], sizes: ["M", "L"] });
  const f = await inventoryCart([{ product: item, quantity: 2, color: "Blue", size: "M" }, { product: item, quantity: 3, color: "Black", size: "L" }]);
  const provider = fakeStripe();
  const result = await createCheckout(f.args, f.context, provider.client);
  const order = await Order.findById(result.order);
  assert.equal((await Product.findById(item._id)).reservedQuantity, 5);
  assert.deepEqual(order.products.map(line => line.size), ["M", "L"]);
  const event = paidInventoryEvent({ order, provider });
  await Promise.all([applyPaymentEvent(event), applyPaymentEvent(event)]);
  const row = await Product.findById(item._id);
  assert.equal(row.stockQuantity, 0);
  assert.equal(row.reservedQuantity, 0);
});

dbtest("an uncertain provider response keeps stock reserved and retries the same immutable request", async () => {
  const item = await inventoryProduct(1);
  const f = await inventoryCart([{ product: item }]);
  const provider = fakeStripe();
  const create = provider.client.checkout.sessions.create;
  let first = true;
  provider.client.checkout.sessions.create = async (...args) => {
    const checkout = await create(...args);
    if (first) { first = false; throw Object.assign(new Error("connection reset after provider created checkout"), { code: "ECONNRESET" }); }
    return checkout;
  };
  await assert.rejects(createCheckout(f.args, f.context, provider.client), /connection reset/);
  assert.equal((await Product.findById(item._id)).reservedQuantity, 1);
  assert.equal(await Order.countDocuments({ cart: f.cart._id }), 1);
  await createCheckout(f.args, f.context, provider.client);
  assert.deepEqual(provider.calls[0], provider.calls[1]);
  assert.equal(provider.sessions.size, 1);
  assert.equal((await Product.findById(item._id)).reservedQuantity, 1);
});

dbtest("customer cancellation verifies ownership and provider expiry, then releases exactly once", async () => {
  const f = await inventoryFixture();
  const other = await makeCustomer();
  await assert.rejects(cancelCheckout(String(f.order._id), other, f.provider.client), error => error.statusCode === 403);
  assert.equal((await Product.findById(f.item._id)).reservedQuantity, 2);
  await Promise.all([cancelCheckout(String(f.order._id), f.context, f.provider.client), cancelCheckout(String(f.order._id), f.context, f.provider.client)]);
  const order = await Order.findById(f.order._id);
  const row = await Product.findById(f.item._id);
  assert.equal(order.inventoryStatus, "RELEASED");
  assert.equal(order.paymentStatus, "FAILED");
  assert.equal(order.orderStatus, "CANCELED");
  assert.equal(order.activeCartKey, undefined);
  assert.equal(row.stockQuantity, 5);
  assert.equal(row.reservedQuantity, 0);
  assert.equal(f.provider.sessions.get(order.checkoutSessionId).status, "expired");
  const retry = await createCheckout(f.args, f.context, f.provider.client);
  assert.notEqual(retry.order, String(order._id), "A canceled attempt must not permanently poison the cart's idempotency key");
  assert.equal((await Product.findById(f.item._id)).reservedQuantity, 2);
});

dbtest("an active checkout prevents a second address from obtaining another hold", async () => {
  const f = await inventoryFixture();
  await assert.rejects(createCheckout({ ...f.args, shippingAddress: { ...address, street: "Changed" } }, f.context, f.provider.client), error => error.statusCode === 409);
  assert.equal(await Order.countDocuments({ cart: f.cart._id }), 1);
  assert.equal((await Product.findById(f.item._id)).reservedQuantity, 2);
});

dbtest("a local expiry or provider outage alone never releases stock", async () => {
  const f = await inventoryFixture();
  const before = new Date(Date.now() - 1000);
  await Order.updateOne({ _id: f.order._id }, { $set: { reservationExpiresAt: before, reservationCheckAfter: before } });
  const expire = f.provider.client.checkout.sessions.expire;
  f.provider.client.checkout.sessions.expire = async () => { throw new Error("provider network unavailable"); };
  await reconcileReservations({ stripeClient: f.provider.client });
  assert.equal((await Product.findById(f.item._id)).reservedQuantity, 2);
  assert.equal((await Order.findById(f.order._id)).paymentStatus, "PENDING");
  f.provider.client.checkout.sessions.expire = expire;
  await Order.updateOne({ _id: f.order._id }, { $set: { reservationCheckAfter: before } });
  await reconcileReservations({ stripeClient: f.provider.client });
  assert.equal((await Product.findById(f.item._id)).reservedQuantity, 0);
  assert.equal((await Order.findById(f.order._id)).inventoryStatus, "RELEASED");
});

dbtest("payment winning a cancellation race commits stock instead of releasing it", async () => {
  const f = await inventoryFixture();
  f.provider.client.checkout.sessions.expire = async id => {
    Object.assign(f.provider.sessions.get(id), { status: "complete", payment_status: "paid", payment_intent: `pi_inventory_${f.order._id}` });
    throw new Error("Session completed before expiry");
  };
  await assert.rejects(cancelCheckout(String(f.order._id), f.context, f.provider.client), error => error.statusCode === 409);
  const row = await Product.findById(f.item._id);
  assert.equal(row.stockQuantity, 3);
  assert.equal(row.reservedQuantity, 0);
  assert.equal((await Order.findById(f.order._id)).paymentStatus, "PAID");
  assert.equal(await Transaction.countDocuments({ order: f.order._id }), 1);
});

dbtest("a delayed success cannot sell stock already released by a definitive expiry", async () => {
  const f = await inventoryFixture();
  await cancelCheckout(String(f.order._id), f.context, f.provider.client);
  await assert.rejects(applyPaymentEvent(paidInventoryEvent(f)), error => error.statusCode === 503);
  assert.equal((await Product.findById(f.item._id)).stockQuantity, 5);
  assert.equal(await Transaction.countDocuments({ order: f.order._id }), 0);
});

dbtest("expired unlinked sessions are recovered from Stripe before stock is released", async () => {
  const f = await inventoryFixture();
  await Order.updateOne({ _id: f.order._id }, { $unset: { checkoutSessionId: 1, checkoutUrl: 1 }, $set: { reservationCheckAfter: new Date(0) } });
  const remote = f.provider.sessions.get(f.order.checkoutSessionId);
  remote.status = "expired"; remote.url = null;
  const now = new Date(f.order.checkoutExpiresAt.getTime() + 180000);
  await reconcileReservations({ stripeClient: f.provider.client, now });
  const order = await Order.findById(f.order._id);
  assert.equal(order.checkoutSessionId, remote.id);
  assert.equal(order.inventoryStatus, "RELEASED");
  assert.equal((await Product.findById(f.item._id)).reservedQuantity, 0);
});

dbtest("an absent provider session only releases after its creation window closes", async () => {
  const f = await inventoryFixture();
  await Order.updateOne({ _id: f.order._id }, { $unset: { checkoutSessionId: 1, checkoutUrl: 1 }, $set: { reservationCheckAfter: new Date(0) } });
  f.provider.sessions.clear();
  await reconcileReservations({ stripeClient: f.provider.client, now: new Date(f.order.checkoutExpiresAt.getTime() - 60000) });
  assert.equal((await Product.findById(f.item._id)).reservedQuantity, 2);
  await reconcileReservations({ stripeClient: f.provider.client, now: new Date(f.order.checkoutExpiresAt.getTime() + 180000) });
  assert.equal((await Product.findById(f.item._id)).reservedQuantity, 0);
  assert.equal((await Order.findById(f.order._id)).inventoryStatus, "RELEASED");
});

dbtest("a malformed provider list cannot be mistaken for proof that no session exists", async () => {
  const f = await inventoryFixture();
  await Order.updateOne({ _id: f.order._id }, { $unset: { checkoutSessionId: 1, checkoutUrl: 1 }, $set: { reservationCheckAfter: new Date(0) } });
  f.provider.client.checkout.sessions.list = async () => ({ data: [] });
  const result = await reconcileReservations({ stripeClient: f.provider.client, now: new Date(f.order.checkoutExpiresAt.getTime() + 180000) });
  assert.ok(result.failed > 0);
  assert.equal((await Product.findById(f.item._id)).reservedQuantity, 2);
  assert.equal((await Order.findById(f.order._id)).inventoryStatus, "RESERVED");
});

dbtest("staff cannot delete reserved products, reduce stock below holds or overwrite a stale version", async () => {
  const item = await inventoryProduct(2);
  const stale = await Product.findById(item._id);
  const f = await inventoryCart([{ product: item }]);
  await createCheckout(f.args, f.context, fakeStripe().client);
  stale.stockQuantity = 1;
  await assert.rejects(stale.save(), error => error.name === "VersionError");
  const permissions = await Permission.create([{ module: "Products", name: "Edit Products" }, { module: "Products", name: "Delete Products" }]);
  await User.updateOne({ _id: admin.userId }, { $set: { permissions: permissions.map(permission => permission._id) } });
  const authorized = await authenticateUser(jwt.sign({ userId: admin.userId }, process.env.JWT_SECRET, { expiresIn: "1h" }));
  await assert.rejects(resolvers.Mutation.updatePhysicalProduct(null, { id: String(item._id), input: { stockQuantity: 0 } }, authorized), error => error.statusCode === 409);
  await assert.rejects(resolvers.Mutation.deletePhysicalProduct(null, { id: String(item._id) }, authorized), error => error.statusCode === 409);
  assert.equal((await Product.findById(item._id)).stockQuantity, 2);
});

dbtest("catalog search and discounted-price sort apply before pagination and count only matching available stock", async () => {
  const prefix = `Search ${++sequence}`;
  const a = await inventoryProduct(3, { title: `${prefix} A`, price: 50, discount: 80 });
  const b = await inventoryProduct(1, { title: `${prefix} B`, price: 20 });
  await inventoryProduct(0, { title: `${prefix} unavailable`, price: 1 });
  const page = await resolvers.Query.physicalProducts(null, { search: prefix, sort: "priceLow", inStock: true, pagination: { page: 1, limit: 1 } }, {});
  assert.equal(page.total, 2);
  assert.equal(page.totalPages, 2);
  assert.equal(String(page.products[0]._id), String(a._id));
  const next = await resolvers.Query.physicalProducts(null, { search: prefix, sort: "priceLow", inStock: true, pagination: { page: 2, limit: 1 } }, {});
  assert.equal(String(next.products[0]._id), String(b._id));
});
