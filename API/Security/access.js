"use strict";
const CustomError = require("../Utilities/CustomError");

/** Only identities resolved from a verified token and a live database record qualify. */
function requireIdentity(context) {
  if (!context?.userId || !context.user || !context.principalType) {
    throw new CustomError("Authentication required", 401);
  }
  if (String(context.user._id) !== String(context.userId)) {
    throw new CustomError("Invalid authentication context", 401);
  }
  return context.user;
}

function objectId(value, label = "Resource") {
  const id = value == null ? "" : String(value);
  if (!/^[a-f0-9]{24}$/i.test(id)) throw new CustomError(`${label} identifier is invalid`, 400);
  return id.toLowerCase();
}

function requireCustomer(context, requestedId = context?.userId) {
  requireIdentity(context);
  if (context.principalType !== "customer") throw new CustomError("Customer session required", 403);
  if (objectId(requestedId, "Customer") !== objectId(context.userId, "Customer")) {
    throw new CustomError("Access denied", 403);
  }
  return String(context.userId);
}

function requireStaff(context) {
  const user = requireIdentity(context);
  if (context.principalType !== "staff" || !["Admin", "User"].includes(user.role)) {
    throw new CustomError("Staff access required", 403);
  }
  objectId(user.company?._id || user.company, "Company");
  return user;
}

function requireAdmin(context) {
  const user = requireStaff(context);
  if (user.role !== "Admin") throw new CustomError("Administrator access required", 403);
  return user;
}

function requirePlatformAdmin(context, configuredIds = process.env.PLATFORM_ADMIN_IDS || "") {
  requireAdmin(context);
  const allowed = configuredIds.split(",").map(id => id.trim().toLowerCase()).filter(Boolean);
  if (!allowed.includes(objectId(context.userId))) {
    throw new CustomError("Platform administrator access required", 403);
  }
}

function requireOwnership(ownerId, customerId) {
  if (!ownerId || objectId(ownerId) !== objectId(customerId)) throw new CustomError("Access denied", 403);
}

function requireCompany(record, context) {
  const user = requireStaff(context);
  if (!record || !record.company || String(record.company?._id || record.company) !== String(user.company?._id || user.company)) {
    // Do not disclose whether a record exists in another tenant.
    throw new CustomError("Resource not found", 404);
  }
  return record;
}

function pagination(page = 1, limit = 10) {
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    throw new CustomError("Invalid pagination: page >= 1 and limit between 1 and 100 are required", 400);
  }
  if (!Number.isSafeInteger((page - 1) * limit)) throw new CustomError("Page is too large", 400);
  return { page, limit, skip: (page - 1) * limit };
}

module.exports = { requireIdentity, objectId, requireCustomer, requireStaff, requireAdmin, requirePlatformAdmin, requireOwnership, requireCompany, pagination };
