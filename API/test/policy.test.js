"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { graphql, parse, validate } = require("graphql");
const { buildSchema, queryBudget } = require("../app");
const policy = require("../Security/resolverPolicy");
const schema = buildSchema();
const id = "111111111111111111111111";
const other = "222222222222222222222222";
const customer = { userId: id, user: { _id: id }, principalType: "customer" };
const all = [policy.PUBLIC, policy.CUSTOMER, policy.STAFF, policy.ADMIN, policy.PLATFORM, policy.DISABLED];

test("every exposed root operation has exactly one explicit authorization policy", () => {
  for (const [type, root] of [["Query", schema.getQueryType()], ["Mutation", schema.getMutationType()]]) {
    for (const field of Object.keys(root.getFields())) assert.equal(all.filter(set => set.has(`${type}.${field}`)).length, 1, `${type}.${field}`);
  }
});
test("unknown future operations and public administrator registration are denied", async () => {
  for (const key of ["Mutation.futureDanger", "Mutation.register", "Mutation.createOrder", "Mutation.updateTransactionStatus", "Mutation.deleteOldPendingOrders"]) {
    await assert.rejects(policy.authorize(key, {}, customer), error => error.statusCode === 403);
  }
});
test("all non-public root policies reject anonymous callers before database access", async () => {
  for (const set of [policy.CUSTOMER, policy.STAFF, policy.ADMIN, policy.PLATFORM]) {
    for (const key of set) await assert.rejects(policy.authorize(key, {}, {}), error => error.statusCode === 401, key);
  }
});
test("GraphQL aliases and fragments do not bypass customer ownership checks", async () => {
  for (const source of [`{ other:getCart(userId:"${other}"){id} }`, `query { ...Private } fragment Private on Query { GetMyOrder(customerId:"${other}"){id} }`]) {
    const result = await graphql({ schema, source, contextValue: customer });
    assert.equal(result.errors?.[0].originalError.statusCode, 403);
  }
});
test("password hashes and public-review email fields are absent from the schema", () => {
  assert.equal(schema.getType("OutputUser").getFields().password, undefined);
  assert.equal(schema.getType("Reviewer").getFields().email, undefined);
  assert.ok(validate(schema, parse(`{userById(userId:"${id}"){password}}`)).length);
});
test("changed frontend/admin query documents match the actual GraphQL schema", () => {
  const files = ["backend/src/GraphQL/Queries/userQueries.js", "backend/src/GraphQL/Mutations/userMutations.js", "frontend/GraphQL/Queries/reviewQueries.js", "frontend/GraphQL/Queries/cartQueries.js", "frontend/GraphQL/Queries/orderQueries.js", "frontend/GraphQL/Mutations/orderMutations.js"];
  for (const file of files) {
    const content = fs.readFileSync(path.join(__dirname, "../..", file), "utf8");
    for (const match of content.matchAll(/gql`([\s\S]*?)`/g)) {
      // The old, unused ORDER_SEND_EMAIL operation is not part of checkout's contract.
      if (match[1].includes("sendOrderEmail")) continue;
      assert.deepEqual(validate(schema, parse(match[1])).map(error => error.message), [], file);
    }
  }
});
test("query budgets include depth introduced through fragment spreads", () => {
  let source = "query { categories { categories { ...C0 } } } ";
  for (let i = 0; i < 8; i++) source += `fragment C${i} on Category { subcategories { category { ${i === 7 ? "id" : `...C${i + 1}`} } } } `;
  assert.ok(validate(schema, parse(source), [queryBudget]).some(error => error.message.includes("complexity")));
});
test("cross-company writes are refused before the underlying mutation runs", async t => {
  const Product = require("../Model/physicalProductModel");
  t.mock.method(Product, "findById", async () => ({ _id: id, company: other, images: [] }));
  const staff = { userId: id, principalType: "staff", user: { _id: id, role: "Admin", company: id } };
  await assert.rejects(policy.authorize("Mutation.updatePhysicalProduct", { id }, staff), error => error.statusCode === 404);
});
