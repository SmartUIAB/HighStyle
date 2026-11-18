"use strict";
const CustomError = require("../Utilities/CustomError");
const { pagination } = require("../Security/access");

function listingOptions(args = {}, physical = false) {
  const { page, limit, skip } = pagination(args.pagination?.page ?? 1, args.pagination?.limit ?? 10);
  const query = {};
  if (args.search != null) {
    if (typeof args.search !== "string" || args.search.length > 120) throw new CustomError("Search must contain at most 120 characters", 400);
    const term = args.search.trim();
    if (term) {
      const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [{ title: regex }, { SKU: regex }, { tags: regex }];
    }
  }
  if (args.inStock) {
    query.status = "Available";
    if (physical) query.$expr = { $gt: [{ $subtract: ["$stockQuantity", { $ifNull: ["$reservedQuantity", 0] }] }, 0] };
  }
  const sorts = {
    featured: { createdAt: -1, _id: 1 },
    priceLow: { _catalogEffectivePrice: 1, _id: 1 },
    priceHigh: { _catalogEffectivePrice: -1, _id: 1 },
    name: { title: 1, _id: 1 },
  };
  const key = args.sort || "featured";
  if (!Object.hasOwn(sorts, key)) throw new CustomError("Unsupported catalog sort", 400);
  const sort = sorts[key];
  return { query, sort, page, limit, skip };
}

async function listCatalog(Model, args, physical = false) {
  const { query, sort, page, limit, skip } = listingOptions(args, physical);
  const result = await Model.aggregate([
    { $match: query },
    { $addFields: { _catalogEffectivePrice: { $multiply: ["$price", { $subtract: [1, { $divide: [{ $ifNull: ["$discount", 0] }, 100] }] }] } } },
    { $facet: { products: [{ $sort: sort }, { $skip: skip }, { $limit: limit }, { $unset: "_catalogEffectivePrice" }], count: [{ $count: "total" }] } },
  ]);
  const total = result[0]?.count[0]?.total || 0;
  return { products: (result[0]?.products || []).map(item => Model.hydrate(item)), totalPages: Math.ceil(total / limit), currentPage: page, total };
}

module.exports = { listCatalog, listingOptions };
