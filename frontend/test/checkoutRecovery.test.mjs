import assert from "node:assert/strict";
import test from "node:test";
import { CHECKOUT_RECOVERY_KEY, clearCheckoutRecovery, hasReservedCheckout, readCheckoutRecovery, writeCheckoutRecovery } from "../components/storefront/checkoutRecovery.mjs";

const customer = "a".repeat(24);
const otherCustomer = "b".repeat(24);
const order = "c".repeat(24);
const otherOrder = "d".repeat(24);
const storage = () => {
  const data = new Map();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
};

test("checkout back-navigation reference is scoped to the signed-in customer", () => {
  const store = storage();
  assert.equal(writeCheckoutRecovery(store, customer, order), true);
  assert.equal(readCheckoutRecovery(store, customer), order);
  assert.equal(readCheckoutRecovery(store, otherCustomer), null);
  assert.equal(readCheckoutRecovery(store, null), null);
});

test("recovering an old completed order never clears another active checkout", () => {
  const store = storage();
  writeCheckoutRecovery(store, customer, order);
  clearCheckoutRecovery(store, otherCustomer, order);
  clearCheckoutRecovery(store, customer, otherOrder);
  assert.equal(readCheckoutRecovery(store, customer), order);
  clearCheckoutRecovery(store, customer, order);
  assert.equal(readCheckoutRecovery(store, customer), null);
});

test("blocked storage and malformed browser data cannot break checkout navigation", () => {
  const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };
  assert.equal(readCheckoutRecovery(blocked, customer), null);
  assert.equal(writeCheckoutRecovery(blocked, customer, order), false);
  assert.doesNotThrow(() => clearCheckoutRecovery(blocked, customer, order));
  const store = storage();
  for (const value of ["not-json", "null", JSON.stringify({ customerId: customer, orderId: "https://evil.test" })]) {
    store.setItem(CHECKOUT_RECOVERY_KEY, value);
    assert.equal(readCheckoutRecovery(store, customer), null);
  }
});

test("only server-reported pending reservations are cancellable recovery candidates", () => {
  assert.equal(hasReservedCheckout({ paymentStatus: "PENDING", inventoryStatus: "RESERVED", orderStatus: "PENDING" }), true);
  for (const state of [null, { paymentStatus: "PAID", inventoryStatus: "RESERVED" }, { paymentStatus: "PENDING", inventoryStatus: "RELEASED" }, { paymentStatus: "PENDING", inventoryStatus: "COMMITTED" }, { paymentStatus: "PENDING", inventoryStatus: "RESERVED", orderStatus: "CANCELED" }]) assert.equal(hasReservedCheckout(state), false);
});
