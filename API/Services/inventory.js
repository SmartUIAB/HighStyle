"use strict";
const CustomError = require("../Utilities/CustomError");
const { objectId } = require("../Security/access");
const Product = require("../Model/physicalProductModel");

function availableQuantity(product) {
  const onHand = product.stockQuantity;
  const held = product.reservedQuantity ?? 0;
  if (!Number.isSafeInteger(onHand) || !Number.isSafeInteger(held) || held < 0 || onHand < held) return 0;
  return onHand - held;
}

function physicalQuantities(products) {
  const totals = new Map();
  for (const product of products) {
    if (product.productType !== "PHYSICAL") continue;
    const id = objectId(product.productId, "Product");
    if (!Number.isSafeInteger(product.quantity) || product.quantity <= 0) throw new CustomError("Invalid inventory quantity", 400);
    const total = (totals.get(id) || 0) + product.quantity;
    if (!Number.isSafeInteger(total) || total > 9900) throw new CustomError("Invalid inventory quantity", 400);
    totals.set(id, total);
  }
  // A stable write order reduces contention between overlapping multi-item carts.
  return [...totals.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function requireTransaction(session) {
  if (!session?.inTransaction()) throw new Error("Inventory changes require a MongoDB transaction");
}

async function reserveInventory(order, session) {
  requireTransaction(session);
  for (const [id, quantity] of physicalQuantities(order.products)) {
    const result = await Product.updateOne({
      _id: id, status: "Available",
      $expr: { $gte: [{ $subtract: ["$stockQuantity", { $ifNull: ["$reservedQuantity", 0] }] }, quantity] },
    }, { $inc: { reservedQuantity: quantity, __v: 1 } }, { session });
    if (result.modifiedCount !== 1) throw new CustomError("An item no longer has enough available stock. Please review your cart.", 409);
  }
}

async function commitInventory(order, session) {
  requireTransaction(session);
  if (order.inventoryStatus === "COMMITTED") return false;
  if (order.inventoryStatus !== "RESERVED") throw new CustomError("Inventory reconciliation is required before accepting this payment", 503);
  for (const [id, quantity] of physicalQuantities(order.products)) {
    const result = await Product.updateOne({ _id: id, stockQuantity: { $gte: quantity }, reservedQuantity: { $gte: quantity } },
      { $inc: { stockQuantity: -quantity, reservedQuantity: -quantity, __v: 1 } }, { session });
    if (result.modifiedCount !== 1) throw new CustomError("Inventory reservation could not be committed", 503);
  }
  order.inventoryStatus = "COMMITTED";
  order.inventoryCommittedAt = new Date();
  order.activeCartKey = undefined;
  return true;
}

async function releaseInventory(order, session, reason) {
  requireTransaction(session);
  if (["RELEASED", "COMMITTED"].includes(order.inventoryStatus)) return false;
  if (order.inventoryStatus !== "RESERVED") throw new CustomError("Legacy inventory requires reconciliation", 503);
  for (const [id, quantity] of physicalQuantities(order.products)) {
    const result = await Product.updateOne({ _id: id, reservedQuantity: { $gte: quantity } },
      { $inc: { reservedQuantity: -quantity, __v: 1 } }, { session });
    if (result.modifiedCount !== 1) throw new CustomError("Inventory reservation could not be released", 503);
  }
  order.inventoryStatus = "RELEASED";
  order.inventoryReleasedAt = new Date();
  order.inventoryReleaseReason = reason;
  order.activeCartKey = undefined;
  return true;
}

module.exports = { availableQuantity, physicalQuantities, reserveInventory, commitInventory, releaseInventory };
