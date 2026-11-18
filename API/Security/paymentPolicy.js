"use strict";
const CustomError = require("../Utilities/CustomError");

function paymentPolicy(env = process.env) {
  const mode = env.STRIPE_MODE || "test";
  if (!["test", "live"].includes(mode)) throw new CustomError("Invalid payment mode", 503);
  if (mode === "live" && (env.APP_ENV !== "production" || env.LIVE_PAYMENTS_APPROVED !== "true")) {
    throw new CustomError("Live payments require separate production approval", 503);
  }
  return { mode, enabled: env.PAYMENTS_ENABLED === "true" };
}

function releaseIdentity(env = process.env) {
  const sha = env.RAILWAY_GIT_COMMIT_SHA || env.RELEASE_SHA || "";
  return {
    commit: /^[a-f0-9]{40}$/.test(sha) ? sha : null,
    environment: env.APP_ENV || "development",
    paymentsEnabled: env.PAYMENTS_ENABLED === "true",
    stripeMode: env.STRIPE_MODE || "test",
  };
}
module.exports = { paymentPolicy, releaseIdentity };
