"use strict";
const CustomError = require("../Utilities/CustomError");
let cachedKey;
let cached;
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new CustomError("Payment service is not configured", 503);
  const mode = process.env.STRIPE_MODE || "test";
  if (!["test", "live"].includes(mode) || !new RegExp(`^[sr]k_${mode}_`).test(key)) throw new CustomError("Payment key and STRIPE_MODE do not match", 503);
  if (key !== cachedKey) {
    cached = new (require("stripe"))(key, { maxNetworkRetries: 2, timeout: 15000 });
    cachedKey = key;
  }
  return cached;
}
module.exports = { getStripe };
