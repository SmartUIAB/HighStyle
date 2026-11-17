"use strict";
const jwt = require("jsonwebtoken");
const User = require("../Model/userModel");
const Customer = require("../Model/customerModel");
const { objectId } = require("../Security/access");

const anonymous = () => ({ userId: null, user: null, principalType: null });

async function authenticateUser(token) {
  if (typeof token !== "string" || !token || !process.env.JWT_SECRET) return anonymous();
  let claims;
  try {
    claims = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    if (!claims || typeof claims !== "object" || !Number.isFinite(claims.exp)) return anonymous();
    if (Boolean(claims.userId) === Boolean(claims.customerId)) return anonymous();
    objectId(claims.userId || claims.customerId);
  } catch (_) {
    // Never log a token or silently authenticate as an environment/service user.
    return anonymous();
  }
  const principalType = claims.userId ? "staff" : "customer";
  const Model = claims.userId ? User : Customer;
  const user = await Model.findById(claims.userId || claims.customerId);
  if (!user) return anonymous();
  const version = claims.authVersion ?? 0;
  if (!Number.isSafeInteger(version) || version < 0 || version !== (user.authVersion || 0)) return anonymous();
  return { userId: String(user._id), user, principalType };
}

module.exports = { authenticateUser };
