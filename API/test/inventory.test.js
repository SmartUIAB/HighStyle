"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { availableQuantity, physicalQuantities, reserveInventory } = require("../Services/inventory");
const { calculateCart } = require("../Services/catalogPricing");
const { listingOptions } = require("../Services/catalogListing");
const { assertCheckoutSession } = require("../Services/checkoutSession");
const id = "111111111111111111111111";

test("availability excludes holds and fails closed for corrupt stock", () => {
  assert.equal(availableQuantity({ stockQuantity: 5, reservedQuantity: 3 }), 2);
  assert.equal(availableQuantity({ stockQuantity: 5 }), 5);
  for (const [stockQuantity, reservedQuantity] of [[1, 2], [1.5, 0], [2, -1], [2, 0.5], [NaN, 0], ["5", 0]]) {
    assert.equal(availableQuantity({ stockQuantity, reservedQuantity }), 0);
  }
});
test("all variants of a product share its physical inventory limit", () => {
  assert.deepEqual(physicalQuantities([
    { productType: "PHYSICAL", productId: id, quantity: 2, size: "M" },
    { productType: "PHYSICAL", productId: id, quantity: 3, size: "L" },
    { productType: "DIGITAL", productId: id, quantity: 9 },
  ]), [[id, 5]]);
  assert.throws(() => physicalQuantities([{ productType: "PHYSICAL", productId: id, quantity: 0 }]), error => error.statusCode === 400);
});
test("cart pricing cannot spend units held by another checkout", () => {
  const product = { _id: id, title: "Test", status: "Available", price: 10, stockQuantity: 2, reservedQuantity: 1 };
  assert.equal(calculateCart([{ ProductID: id, quantity: 1 }], [product], []).amountMinor, 1000);
  assert.throws(() => calculateCart([{ ProductID: id, quantity: 2 }], [product], []), error => error.statusCode === 409);
});
test("inventory writes cannot accidentally run outside a transaction", async () => {
  await assert.rejects(reserveInventory({ products: [] }), /MongoDB transaction/);
});
test("catalog search treats regular-expression syntax as literal text", () => {
  const options = listingOptions({ search: "shirt (M)+.*", sort: "priceLow", inStock: true }, true);
  const regex = options.query.$or[0].title;
  assert.equal(regex.test("shirt (M)+.*"), true);
  assert.equal(regex.test("shirt MMMMM"), false);
  assert.ok(options.query.$expr);
  assert.deepEqual(options.sort, { _catalogEffectivePrice: 1, _id: 1 });
  assert.throws(() => listingOptions({ search: "x".repeat(121) }), error => error.statusCode === 400);
  assert.throws(() => listingOptions({ sort: "__proto__" }), error => error.statusCode === 400);
});

test("provider sessions require an explicit matching mode, amount, currency and order binding", () => {
  const previous = process.env.STRIPE_MODE;
  process.env.STRIPE_MODE = "test";
  try {
    const order = { _id: id, customer: "222222222222222222222222", amountMinor: 1000, currency: "usd" };
    const checkout = { id: "cs_test_checkout", mode: "payment", status: "open", payment_status: "unpaid", livemode: false, amount_total: 1000, currency: "usd", client_reference_id: id, metadata: { orderId: id, customerId: order.customer }, url: "https://checkout.stripe.com/c/pay/cs_test_checkout" };
    assert.doesNotThrow(() => assertCheckoutSession(order, checkout));
    for (const patch of [{ livemode: undefined }, { livemode: true }, { amount_total: 999 }, { currency: "eur" }, { client_reference_id: "unrelated" }, { metadata: {} }, { status: "unknown" }, { mode: "subscription" }, { url: "https://checkout.stripe.com.attacker.invalid/pay" }, { url: null }]) {
      assert.throws(() => assertCheckoutSession(order, { ...checkout, ...patch }), error => error.statusCode === 502);
    }
    assert.throws(() => assertCheckoutSession(order, null), error => error.statusCode === 502);
  } finally {
    if (previous === undefined) delete process.env.STRIPE_MODE; else process.env.STRIPE_MODE = previous;
  }
});
