"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const User = require("../Model/userModel");
const Customer = require("../Model/customerModel");
const { authenticateUser } = require("../Utilities/authUtils");
const id = "111111111111111111111111";
const secret = "unit-test-only-not-a-real-signing-key";
process.env.JWT_SECRET = secret;
const sign = (claims, options = {}) => jwt.sign(claims, secret, { expiresIn: "1h", ...options });

test("invalid, expired, wrong-algorithm and ambiguous tokens are anonymous", async () => {
  const values = [undefined, "", "broken", sign({ customerId: id }, { expiresIn: -1 }), sign({ customerId: id }, { algorithm: "HS384" }), sign({ customerId: id, userId: id }), sign({ role: "Admin" }), sign({ customerId: "bad-id" }), jwt.sign({ customerId: id }, "other-key"), jwt.sign({ customerId: id }, secret)];
  for (const value of values) assert.deepEqual(await authenticateUser(value), { userId: null, user: null, principalType: null });
});
test("a deleted account cannot retain an authenticated ID", async t => {
  t.mock.method(Customer, "findById", async () => null);
  assert.deepEqual(await authenticateUser(sign({ customerId: id })), { userId: null, user: null, principalType: null });
});
test("customer and staff identities come from separate live database records", async t => {
  t.mock.method(Customer, "findById", async () => ({ _id: id, firstname: "Customer" }));
  t.mock.method(User, "findById", async () => ({ _id: id, role: "Admin", company: id }));
  assert.equal((await authenticateUser(sign({ customerId: id, role: "Admin" }))).principalType, "customer");
  assert.equal((await authenticateUser(sign({ userId: id }))).principalType, "staff");
});
test("an environment token is never used for missing user credentials", async () => {
  process.env.TOKEN = sign({ userId: id });
  assert.equal((await authenticateUser(undefined)).userId, null);
  delete process.env.TOKEN;
});

test("password changes invalidate older tokens without trusting claimed versions", async t => {
  t.mock.method(Customer, "findById", async () => ({ _id: id, authVersion: 2 }));
  for (const claims of [{ customerId: id }, { customerId: id, authVersion: 1 }, { customerId: id, authVersion: -1 }, { customerId: id, authVersion: "2" }]) assert.equal((await authenticateUser(sign(claims))).userId, null);
  assert.equal((await authenticateUser(sign({ customerId: id, authVersion: 2 }))).userId, id);
});
