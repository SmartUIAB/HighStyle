"use strict";
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const jwt = require("jsonwebtoken");
const Stripe = require("stripe");
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "http-tests-only-not-a-deployment-key";
process.env.STRIPE_SECRET_KEY = "sk_test_ci_placeholder_not_a_real_key";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_ci_only";
process.env.CORS_ALLOWED_ORIGINS = "http://localhost:3000,http://localhost:3001";
const { createApp } = require("../app");
const { cookieOptions, createAttemptLimiter, allowedOrigins, validatePassword } = require("../Security/http");
let http;
let server;
let base;
before(async () => {
  const application = await createApp();
  server = application.server;
  http = application.app.listen(0, "127.0.0.1");
  await once(http, "listening");
  base = `http://127.0.0.1:${http.address().port}`;
});
after(async () => {
  http?.closeAllConnections();
  if (http) await new Promise(resolve => http.close(resolve));
  await server?.stop();
});
const payload = JSON.stringify({ id: "evt_ci_signature", type: "customer.created", livemode: false, data: { object: { id: "cus_ci" } } });
const signed = value => Stripe.webhooks.generateTestHeaderString({ payload: value, secret: "whsec_ci_only" });
const webhook = (body, signature) => fetch(`${base}/webhook`, { method: "POST", headers: { "Content-Type": "application/json", ...(signature ? { "Stripe-Signature": signature } : {}) }, body });

test("the real webhook route verifies a signed raw payload before JSON parsing", async () => {
  const response = await webhook(payload, signed(payload));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { received: true, ignored: true });
});
test("an altered body and missing signatures are rejected", async () => {
  assert.equal((await webhook(payload + " ", signed(payload))).status, 400);
  assert.equal((await webhook(payload)).status, 400);
});
test("a missing webhook secret never falls back to trusting JSON", async () => {
  delete process.env.STRIPE_WEBHOOK_SECRET;
  try { assert.equal((await webhook(payload, signed(payload))).status, 503); }
  finally { process.env.STRIPE_WEBHOOK_SECRET = "whsec_ci_only"; }
});
test("legacy undefined POST / handler is not exposed", async () => assert.equal((await fetch(base, { method: "POST" })).status, 404));
test("readiness is not successful while MongoDB is disconnected", async () => {
  assert.equal((await fetch(`${base}/health/live`)).status, 200);
  assert.equal((await fetch(`${base}/health/ready`)).status, 503);
});
test("CORS permits only configured origins with credentials", async () => {
  const good = await fetch(`${base}/graphql`, { method: "OPTIONS", headers: { Origin: "http://localhost:3001", "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type,apollo-require-preflight" } });
  assert.equal(good.status, 204);
  assert.equal(good.headers.get("access-control-allow-origin"), "http://localhost:3001");
  assert.equal(good.headers.get("access-control-allow-credentials"), "true");
  assert.equal((await fetch(`${base}/graphql`, { method: "OPTIONS", headers: { Origin: "https://untrusted.example", "Access-Control-Request-Method": "POST" } })).status, 403);
});
test("public requests never inherit an environment token", async () => {
  process.env.TOKEN = jwt.sign({ userId: "111111111111111111111111" }, process.env.JWT_SECRET, { expiresIn: "1h" });
  try {
    const response = await fetch(`${base}/graphql`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: "{getAllOrders{totalCount}}" }) });
    assert.equal((await response.json()).errors[0].extensions.code, "UNAUTHENTICATED");
  } finally { delete process.env.TOKEN; }
});
test("anonymous multipart uploads are rejected before storing file data", async () => {
  const response = await fetch(`${base}/graphql`, { method: "POST", headers: { "Content-Type": "multipart/form-data; boundary=ci" }, body: "--ci--\r\n" });
  assert.equal(response.status, 401);
});
test("cookie policy is shared, explicit, and forbids insecure SameSite=None", () => {
  assert.deepEqual(cookieOptions(1000, { NODE_ENV: "test" }), { httpOnly: true, secure: false, sameSite: "lax", path: "/", maxAge: 1000 });
  assert.throws(() => cookieOptions(null, { COOKIE_SAME_SITE: "none" }));
  assert.equal(cookieOptions(null, { NODE_ENV: "production", COOKIE_SAME_SITE: "none" }).secure, true);
});
test("production CORS cannot silently use wildcard or localhost defaults", () => {
  assert.throws(() => allowedOrigins({ NODE_ENV: "production" }));
  assert.throws(() => allowedOrigins({ NODE_ENV: "production", CORS_ALLOWED_ORIGINS: "*" }));
  assert.throws(() => allowedOrigins({ NODE_ENV: "production", CORS_ALLOWED_ORIGINS: "http://store.example" }));
});
test("authentication throttling is bounded and expires without weakening active limits", () => {
  let time = 0;
  const limit = createAttemptLimiter({ limit: 2, windowMs: 10, capacity: 1, now: () => time });
  limit("one"); limit("one");
  assert.throws(() => limit("one"), error => error.statusCode === 429);
  assert.throws(() => limit("two"), error => error.statusCode === 429);
  time = 11; limit("two");
});
test("password limits account for bcrypt's UTF-8 byte limit", () => {
  assert.throws(() => validatePassword("short"));
  assert.throws(() => validatePassword("😀".repeat(20)));
  assert.equal(validatePassword("correct-horse-2026"), undefined);
});
