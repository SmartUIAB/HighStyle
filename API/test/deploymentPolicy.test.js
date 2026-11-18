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
