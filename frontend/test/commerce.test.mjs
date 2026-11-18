import assert from "node:assert/strict";
import test from "node:test";
import { availableUnits, checkoutDestination, discountedAmount, formatMoney, imageSource, localizedPath, safeReturnPath } from "../components/storefront/commerce.mjs";

test("checkout redirects only to Stripe hosted checkout with HTTPS and no credentials", () => {
  assert.equal(checkoutDestination("https://checkout.stripe.com/c/pay/cs_test_example#session"), "https://checkout.stripe.com/c/pay/cs_test_example#session");
  for (const value of ["javascript:alert(1)", "http://checkout.stripe.com/c/pay/id", "https://checkout.stripe.com.evil.test/c/pay/id", "https://evil.test/?url=https://checkout.stripe.com/c/pay/id", "https://user:password@checkout.stripe.com/c/pay/id", "https://checkout.stripe.com:444/c/pay/id", "https://checkout.stripe.com/account", "/en/page/order-success", null]) assert.equal(checkoutDestination(value), null);
});

test("login returns keep the intended local route and reject external destinations", () => {
  assert.equal(safeReturnPath("/ar/page/account/cart?checkout_order=abc", "ar"), "/ar/page/account/cart?checkout_order=abc");
  assert.equal(safeReturnPath("/product-details/abc", "sv"), "/sv/product-details/abc");
  for (const path of ["https://evil.test", "//evil.test", "/\\evil.test", "\r\nhttps://evil.test", ["/en"]]) assert.equal(safeReturnPath(path, "ar"), "/ar");
});

test("locale routes are stable without localStorage and never get duplicate prefixes", () => {
  assert.equal(localizedPath("/en/page/account/cart", "ar"), "/en/page/account/cart");
  assert.equal(localizedPath("/#collection", "ar"), "/ar/#collection");
  assert.equal(localizedPath("/page/account/cart", "unsupported"), "/en/page/account/cart");
  assert.equal(localizedPath(undefined, "ar"), "/ar");
});

test("display discount rounding matches server minor-unit pricing", () => {
  assert.equal(discountedAmount({ price: 0.105, discount: 50 }), 0.06);
  assert.equal(discountedAmount({ price: 12.34, discount: 15 }), 10.49);
  assert.equal(discountedAmount({ price: 12.34, discount: 100 }), 0);
  for (const product of [{ price: -2 }, { price: Infinity }, { price: 20, discount: 101 }, { price: "bad" }]) assert.equal(discountedAmount(product), null);
});

test("stock selection uses available quantity and never physical on-hand stock", () => {
  assert.equal(availableUnits({ status: "Available", stockQuantity: 10, availableQuantity: 2 }), 2);
  assert.equal(availableUnits({ status: "Available", stockQuantity: 10, availableQuantity: 0 }), 0);
  assert.equal(availableUnits({ status: "Available", stockQuantity: 10 }), 0);
  assert.equal(availableUnits({ status: "Hidden", availableQuantity: 8 }), 0);
  assert.equal(availableUnits({ status: "Available", availableQuantity: 1000 }), 99);
  assert.equal(availableUnits({ status: "Available", availableQuantity: 1.5 }), 0);
  assert.equal(availableUnits({ status: "Available" }, "digital"), 99);
});

test("images preserve verified absolute HTTPS and scoped upload paths", () => {
  assert.equal(imageSource("/uploads/item.jpg", "https://api.example/"), "https://api.example/uploads/item.jpg");
  assert.equal(imageSource("/assets/images/home-banner/2.jpg"), "/assets/images/home-banner/2.jpg");
  assert.equal(imageSource("https://images.example/item.jpg"), "https://images.example/item.jpg");
  for (const path of ["javascript:alert(1)", "//evil.test/pixel", "/uploads/../private", "", null]) assert.equal(imageSource(path), "/assets/images/icon-empty-cart.png");
});

test("currency labels remain explicit and invalid amounts are never shown as a free item", () => {
  assert.match(formatMoney(10.5, "en"), /USD.*10\.50/);
  assert.equal(formatMoney(null, "en"), "—");
  assert.equal(formatMoney(NaN, "en"), "—");
});
