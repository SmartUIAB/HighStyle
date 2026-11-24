"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { paymentPolicy, releaseIdentity } = require("../Security/paymentPolicy");
const { mailOptions } = require("../Services/mailTransport");

test("test checkout is explicit and live mode requires separately approved production", () => {
  assert.deepEqual(paymentPolicy({}), { mode: "test", enabled: false });
  assert.deepEqual(paymentPolicy({ APP_ENV: "staging", PAYMENTS_ENABLED: "true", STRIPE_MODE: "test" }), { mode: "test", enabled: true });
  for (const env of [{ STRIPE_MODE: "live" }, { STRIPE_MODE: "live", APP_ENV: "staging", LIVE_PAYMENTS_APPROVED: "true" }, { STRIPE_MODE: "live", APP_ENV: "production" }, { STRIPE_MODE: "other" }]) assert.throws(() => paymentPolicy(env));
});
test("deployment identity reveals no credentials and refuses malformed commit values", () => {
  const identity = releaseIdentity({ RELEASE_SHA: "x", STRIPE_SECRET_KEY: "sensitive", JWT_SECRET: "sensitive", APP_ENV: "staging" });
  assert.deepEqual(identity, { commit: null, environment: "staging", paymentsEnabled: false, stripeMode: "test" });
  assert.equal(releaseIdentity({ RAILWAY_GIT_COMMIT_SHA: "a".repeat(40) }).commit, "a".repeat(40));
});
test("SMTP supports isolated Mailpit without authentication and TLS providers with authentication", () => {
  assert.equal(mailOptions({}), null);
  const local = mailOptions({ SMTP_HOST: "mailpit.railway.internal", SMTP_PORT: "1025" });
  assert.equal(local.auth, undefined);
  assert.equal(local.secure, false);
  assert.equal(mailOptions({ SMTP_HOST: "smtp.example.com", SMTP_PORT: "465", USER_EMAIL: "sender@example.com", USER_EMAIL_PASSWORD: "test" }).secure, true);
  assert.throws(() => mailOptions({ SMTP_HOST: "smtp.example.com", SMTP_PORT: "0" }));
});

test("staging fixtures refuse production or an unexpected database before connecting", async () => {
  const { seedStaging } = require("../scripts/seed-staging");
  const previous = { APP_ENV: process.env.APP_ENV, SEED_STAGING_CATALOG: process.env.SEED_STAGING_CATALOG, MONGODB_ATLAS: process.env.MONGODB_ATLAS };
  try {
    process.env.SEED_STAGING_CATALOG = "true";
    process.env.APP_ENV = "production";
    await assert.rejects(seedStaging(), /restricted to staging/);
    process.env.APP_ENV = "staging";
    process.env.MONGODB_ATLAS = "mongodb://127.0.0.1/highstyle_production";
    await assert.rejects(seedStaging(), /refusing connection/);
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});

test("staging seed parser accepts canonical replica-set, SRV, IPv6 and encoded URIs without connecting", () => {
  const { seedDatabaseName } = require("../scripts/seed-staging");
  for (const uri of [
    "mongodb://mongo.invalid:27017/highstyle_staging",
    "mongodb://one.invalid:27017,two.invalid:27017,three.invalid:27017/highstyle_staging?replicaSet=rs0",
    "mongodb://seed:p%40ss%3Aword@one.invalid:27017,two.invalid:27017/highstyle_staging?replicaSet=rs0&authSource=admin",
    "mongodb+srv://cluster.invalid/highstyle_staging?authSource=admin",
    "mongodb://[::1]:27017,[::2]:27017/highstyle_staging?replicaSet=rs0",
    "mongodb://mongo.invalid/%68ighstyle_staging",
  ]) assert.equal(seedDatabaseName(uri), "highstyle_staging");
});

test("staging seed parser preserves the exact database allowlist instead of trusting authSource or a suffix", () => {
  const { seedDatabaseName } = require("../scripts/seed-staging");
  for (const uri of [
    "mongodb://mongo.invalid/highstyle_production",
    "mongodb://seed:password@mongo.invalid/production?authSource=highstyle_staging",
    "mongodb://seed:password@mongo.invalid/?authSource=highstyle_staging",
    "mongodb://mongo.invalid/highstyle_staging_ci",
    "mongodb://mongo.invalid/highstyle_stagingproduction",
    "mongodb://mongo.invalid/highstyle_staging/production",
    "mongodb://mongo.invalid/highstyle_staging%2Fproduction",
    "https://mongo.invalid/highstyle_staging",
    "mongodb+srv://one.invalid,two.invalid/highstyle_staging",
    "",
    undefined,
  ]) assert.throws(() => seedDatabaseName(uri), /Invalid staging database configuration|refusing connection/);
});

test("staging seed parser errors never disclose a connection password", () => {
  const { seedDatabaseName } = require("../scripts/seed-staging");
  const password = "DO_NOT_LOG_SEED_PASSWORD";
  assert.throws(
    () => seedDatabaseName(`mongodb://seed:${password}@mongo.invalid/highstyle_staging?tls=invalid`),
    error => error.message === "Invalid staging database configuration" && !error.message.includes(password),
  );
});
