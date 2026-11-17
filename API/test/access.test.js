"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { requireIdentity, objectId, requireCustomer, requireStaff, requireAdmin, requirePlatformAdmin, requireOwnership, requireCompany, pagination } = require("../Security/access");
const customerId = "111111111111111111111111";
const otherId = "222222222222222222222222";
const companyId = "aaaaaaaaaaaaaaaaaaaaaaaa";
const customer = { userId: customerId, user: { _id: customerId }, principalType: "customer" };
const admin = { userId: otherId, user: { _id: otherId, role: "Admin", company: companyId }, principalType: "staff" };
const rejects = (fn, status) => assert.throws(fn, err => err.statusCode === status);

test("anonymous and partial contexts are never authenticated", () => {
  for (const context of [undefined, {}, { userId: customerId }, { ...customer, user: null }, { ...customer, principalType: null }]) rejects(() => requireIdentity(context), 401);
});
test("authenticated ID must match the resolved database record", () => rejects(() => requireIdentity({ ...customer, userId: otherId }), 401));
test("customer can access only their own resource", () => {
  assert.equal(requireCustomer(customer, customerId), customerId);
  rejects(() => requireCustomer(customer, otherId), 403);
  rejects(() => requireCustomer(admin, otherId), 403);
});
test("customer cannot become staff by supplying a role", () => rejects(() => requireStaff({ ...customer, user: { _id: customerId, role: "Admin", company: companyId } }), 403));
test("staff principal must have a real staff role and company", () => {
  assert.equal(requireStaff(admin), admin.user);
  rejects(() => requireStaff({ ...admin, user: { ...admin.user, role: "cron-job" } }), 403);
  rejects(() => requireStaff({ ...admin, user: { ...admin.user, company: null } }), 400);
});
test("staff is not automatically an administrator", () => rejects(() => requireAdmin({ ...admin, user: { ...admin.user, role: "User" } }), 403));
test("global operations need an explicit server-side allowlist", () => {
  rejects(() => requirePlatformAdmin(admin, ""), 403);
  rejects(() => requirePlatformAdmin(admin, customerId), 403);
  assert.equal(requirePlatformAdmin(admin, otherId), undefined);
});
test("resource tenancy cannot be changed by providing another ID", () => {
  assert.equal(requireCompany({ company: companyId }, admin).company, companyId);
  rejects(() => requireCompany({ company: otherId }, admin), 404);
  rejects(() => requireCompany(null, admin), 404);
  rejects(() => requireCompany({}, admin), 404);
});
test("ownership checks fail closed for absent or unrelated owners", () => {
  assert.equal(requireOwnership(customerId, customerId), undefined);
  rejects(() => requireOwnership(otherId, customerId), 403);
  rejects(() => requireOwnership(null, customerId), 403);
});
test("ObjectId validation rejects query objects, paths and malformed IDs", () => {
  assert.equal(objectId(companyId.toUpperCase()), companyId);
  for (const value of [null, undefined, "", { $ne: null }, "../private", "x".repeat(24), "1".repeat(23)]) rejects(() => objectId(value), 400);
});
test("pagination has bounded integer limits", () => {
  assert.deepEqual(pagination(2, 10), { page: 2, limit: 10, skip: 10 });
  for (const values of [[0, 10], [1, 0], [1, 101], [1.5, 10], [1, NaN], [Number.MAX_SAFE_INTEGER, 100]]) rejects(() => pagination(...values), 400);
});
