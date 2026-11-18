"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateCart, moneyMinor, quantity } = require("../Services/catalogPricing");
const { checkoutUrls, shippingAddress } = require("../Services/checkout");
const id = "111111111111111111111111";
const product = { _id: id, title: "Catalog title", status: "Available", price: 12.34, discount: 0, stockQuantity: 10, images: ["/uploads/catalog.jpg"] };
const line = { ProductID: id, quantity: 2, price: 0.01, totalAmount: 0.01, title: "Forged client title" };
const bad = (fn, code = 400) => assert.throws(fn, error => error.statusCode === code);

test("prices, titles and images are derived only from the trusted catalog", () => {
  const result = calculateCart([line], [product], []);
  assert.equal(result.amountMinor, 2468);
  assert.equal(result.totalAmount, 24.68);
  assert.equal(result.products[0].price, 12.34);
  assert.equal(result.products[0].title, product.title);
  assert.equal(result.products[0].image, product.images[0]);
});
test("discount rounding happens on minor units before multiplication", () => {
  const result = calculateCart([{ ...line, quantity: 3 }], [{ ...product, price: 9.99, discount: 10 }], []);
  assert.equal(result.products[0].unitAmountMinor, 899);
  assert.equal(result.amountMinor, 2697);
});
test("stock is enforced across duplicate lines and variants", () => bad(() => calculateCart([{ ...line, quantity: 6 }, { ...line, quantity: 5 }], [product], []), 409));
test("quantities reject negatives, fractions, strings and oversized values", () => {
  for (const value of [-1, 0, 1.5, "2", NaN, 100]) bad(() => quantity(value));
  assert.equal(quantity(0, true), 0);
});
test("missing/unavailable catalog items cannot be ordered", () => {
  bad(() => calculateCart([line], [], []));
  bad(() => calculateCart([line], [{ ...product, status: "Unavailable" }], []));
});
test("arbitrary variant selections are rejected", () => {
  bad(() => calculateCart([{ ...line, color: "pink" }], [{ ...product, colors: ["blue"] }], []));
  bad(() => calculateCart([line], [{ ...product, sizes: ["M"] }], []));
  assert.equal(calculateCart([{ ...line, color: "blue", size: "M" }], [{ ...product, colors: ["blue"], sizes: ["M"] }], []).amountMinor, 2468);
});
test("invalid catalog prices and discounts fail closed", () => {
  for (const price of [NaN, Infinity, -1, "12", 1_000_001]) bad(() => moneyMinor(price));
  for (const discount of [-1, 101, Infinity, "10"]) bad(() => calculateCart([line], [{ ...product, discount }], []));
});
test("empty carts are valid but oversized cart payloads are not", () => {
  assert.equal(calculateCart([], [], []).amountMinor, 0);
  bad(() => calculateCart(Array(101).fill(line), [product], []));
});
test("ambiguous IDs across product collections are rejected", () => bad(() => calculateCart([line], [product], [product])));
test("digital pricing does not depend on physical-stock fields", () => assert.equal(calculateCart([line], [], [{ ...product, stockQuantity: undefined }]).amountMinor, 2468));
test("checkout links use configured origin and an allowlisted locale", () => {
  const urls = checkoutUrls("ar", "https://store.example");
  assert.equal(urls.success_url, "https://store.example/ar/page/order-success");
  assert.equal(urls.cancel_url, "https://store.example/ar/page/account/cart");
  bad(() => checkoutUrls("//evil.example", "https://store.example"));
  bad(() => checkoutUrls("en", "javascript:alert(1)"), 503);
  bad(() => checkoutUrls("en", "https://user:pass@store.example"), 503);
});
test("shipping address must be complete and bounded", () => {
  const address = { street: " Street ", city: "City", state: "State", country: "SE", postalCode: "12345" };
  assert.equal(shippingAddress(address).street, "Street");
  bad(() => shippingAddress({ ...address, city: "" }));
  bad(() => shippingAddress({ ...address, street: "a".repeat(201) }));
});
