"use strict";
const CustomError = require("../Utilities/CustomError");
const { objectId } = require("../Security/access");
const { availableQuantity } = require("./inventory");

function quantity(value, allowZero = false) {
  if (!Number.isSafeInteger(value) || value < (allowZero ? 0 : 1) || value > 99) {
    throw new CustomError("Quantity must be an integer between 1 and 99 (0 removes an item)", 400);
  }
  return value;
}

function moneyMinor(value) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1_000_000) {
    throw new CustomError("Catalog price is invalid", 400);
  }
  return Math.round((value + Number.EPSILON) * 100);
}

/** Pure pricing: client title, price, image and totals are deliberately never trusted. */
function calculateCart(lines, physical, digital) {
  if (!Array.isArray(lines) || lines.length > 100) throw new CustomError("A cart may contain at most 100 lines", 400);
  const catalog = new Map();
  for (const [records, type] of [[physical, "PHYSICAL"], [digital, "DIGITAL"]]) {
    for (const product of records) {
      const id = objectId(product._id);
      if (catalog.has(id)) throw new CustomError("Ambiguous catalog reference", 400);
      catalog.set(id, { product, type });
    }
  }
  const quantities = new Map();
  let amountMinor = 0;
  const products = lines.map(line => {
    const id = objectId(line.ProductID, "Product");
    const entry = catalog.get(id);
    if (!entry || entry.product.status !== "Available") throw new CustomError("A product is unavailable", 400);
    const { product, type } = entry;
    const count = quantity(line.quantity);
    const discount = product.discount ?? 0;
    if (typeof discount !== "number" || !Number.isFinite(discount) || discount < 0 || discount > 100) throw new CustomError("Catalog discount is invalid", 400);
    for (const [value, options, label] of [[line.color, product.colors, "color"], [line.size, product.sizes, "size"]]) {
      if (options?.length && !options.includes(value)) throw new CustomError(`Select a valid product ${label}`, 400);
      if (value != null && (typeof value !== "string" || value.length > 100)) throw new CustomError(`Invalid ${label}`, 400);
    }
    const requested = (quantities.get(id) || 0) + count;
    quantities.set(id, requested);
    if (type === "PHYSICAL" && requested > availableQuantity(product)) throw new CustomError("Requested quantity exceeds available stock", 409);
    const unitAmountMinor = Math.round(moneyMinor(product.price) * (100 - discount) / 100);
    const totalAmountMinor = unitAmountMinor * count;
    amountMinor += totalAmountMinor;
    if (!Number.isSafeInteger(amountMinor) || amountMinor > 99_999_999) throw new CustomError("Cart amount exceeds supported limit", 400);
    return {
      ...(line._id ? { _id: objectId(line._id, "Cart line") } : {}),
      ProductID: id, productType: type, title: product.title,
      price: unitAmountMinor / 100, quantity: count,
      color: line.color || "", size: line.size || "", image: product.images?.[0] || "",
      totalAmount: totalAmountMinor / 100, unitAmountMinor, totalAmountMinor,
    };
  });
  return { products, amountMinor, totalAmount: amountMinor / 100 };
}

async function priceCart(lines, { session } = {}) {
  if (!Array.isArray(lines) || lines.length > 100) throw new CustomError("Invalid cart lines", 400);
  const ids = [...new Set(lines.map(line => objectId(line.ProductID, "Product")))];
  if (!ids.length) return { products: [], amountMinor: 0, totalAmount: 0 };
  const Physical = require("../Model/physicalProductModel");
  const Digital = require("../Model/digitalProductModel");
  // MongoDB does not support parallel operations inside the same transaction.
  const physical = await Physical.find({ _id: { $in: ids } }).session(session || null).lean();
  const digital = await Digital.find({ _id: { $in: ids } }).session(session || null).lean();
  return calculateCart(lines, physical, digital);
}

module.exports = { quantity, moneyMinor, calculateCart, priceCart };
