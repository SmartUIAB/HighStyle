"use strict";
const CustomError = require("../Utilities/CustomError");

function allowedOrigins(env = process.env) {
  const defaults = env.NODE_ENV === "production" ? "" : "http://localhost:3000,http://localhost:3001";
  const origins = (env.CORS_ALLOWED_ORIGINS || defaults).split(",").map(value => value.trim()).filter(Boolean);
  if (!origins.length) throw new Error("CORS_ALLOWED_ORIGINS must be explicitly configured");
  for (const origin of origins) {
    const url = new URL(origin);
    if (url.origin !== origin || !["http:", "https:"].includes(url.protocol) || (env.NODE_ENV === "production" && url.protocol !== "https:")) throw new Error("CORS origins must be exact HTTP(S) origins (HTTPS in production)");
  }
  return new Set(origins);
}

function cookieOptions(maxAge, env = process.env) {
  const sameSite = (env.COOKIE_SAME_SITE || "lax").toLowerCase();
  const secure = env.NODE_ENV === "production" || env.COOKIE_SECURE === "true";
  if (!["lax", "strict", "none"].includes(sameSite) || (sameSite === "none" && !secure)) throw new Error("Invalid session cookie configuration");
  return { httpOnly: true, secure, sameSite, path: "/", ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}), ...(maxAge == null ? {} : { maxAge }) };
}

function createAttemptLimiter({ limit = 20, windowMs = 15 * 60 * 1000, capacity = 10000, now = Date.now } = {}) {
  const buckets = new Map();
  return key => {
    const time = now();
    let bucket = buckets.get(key);
    if (!bucket || bucket.until <= time) {
      if (buckets.size >= capacity) {
        for (const [id, entry] of buckets) if (entry.until <= time) buckets.delete(id);
        if (buckets.size >= capacity && !buckets.has(key)) throw new CustomError("Authentication service is busy; retry later", 429);
      }
      bucket = { count: 0, until: time + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count++;
    if (bucket.count > limit) throw new CustomError("Too many authentication attempts; retry later", 429);
  };
}

function validatePassword(password) {
  if (typeof password !== "string" || password.length < 10 || Buffer.byteLength(password, "utf8") > 72) throw new CustomError("Password must contain at least 10 characters and at most 72 UTF-8 bytes", 400);
}
module.exports = { allowedOrigins, cookieOptions, createAttemptLimiter, validatePassword };
