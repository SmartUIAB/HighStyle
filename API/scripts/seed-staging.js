"use strict";
// Explicit, repeatable staging fixtures. This script never writes production data.
require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const Company = require("../Model/companyModel");
const Category = require("../Model/categoryModel");
const PhysicalProduct = require("../Model/physicalProductModel");

async function seedStaging() {
  if (process.env.SEED_STAGING_CATALOG !== "true") return;
  if (process.env.APP_ENV !== "staging") throw new Error("Catalog fixtures are restricted to staging");
  let uri;
  try { uri = new URL(process.env.MONGODB_ATLAS); } catch (_) { throw new Error("Invalid staging database configuration"); }
  if (!["mongodb:", "mongodb+srv:"].includes(uri.protocol) || uri.pathname !== "/highstyle_staging") {
    throw new Error("Unexpected staging database; refusing connection before any model initialization");
  }
  await require("../Config/DataBase")();
  try {
    if (mongoose.connection.name !== "highstyle_staging") throw new Error("Unexpected staging database; no fixtures were written");
    if (await PhysicalProduct.exists({ SKU: { $not: /^STAGING-/ } })) throw new Error("Non-fixture catalog found; refusing automatic seeding");
    await Promise.all([Company.init(), Category.init(), PhysicalProduct.init()]);
    const company = await Company.findOneAndUpdate({ name: "HighStyle Staging Fixtures" }, { $setOnInsert: { name: "HighStyle Staging Fixtures" } }, { upsert: true, new: true });
    const category = await Category.findOneAndUpdate({ company: company._id, name: "Studio collection" }, { $setOnInsert: { company: company._id, name: "Studio collection", type: "Physical", description: "Staging catalog for purchase acceptance only." } }, { upsert: true, new: true });
    const samples = [
      ["Studio edit 01", "1.jpg", 39, 12],
      ["Studio edit 02", "5.jpg", 49, 8],
      ["Studio edit 03", "10.jpg", 59, 6],
      ["Studio edit 04", "15.jpg", 69, 4],
      ["Studio edit 05", "20.jpg", 45, 2],
      ["Studio edit 06", "25.jpg", 55, 0],
    ];
    for (let i = 0; i < samples.length; i++) {
      const [title, image, price, stockQuantity] = samples[i];
      const SKU = `STAGING-STUDIO-${String(i + 1).padStart(2, "0")}`;
      await PhysicalProduct.findOneAndUpdate({ SKU }, { $setOnInsert: {
        SKU, title, price, stockQuantity, reservedQuantity: 0, company: company._id, category: category._id,
        discount: 0, status: "Available", sizes: ["S", "M", "L"], colors: [], tags: ["staging", "sample"],
        description: "Staging sample for testing product selection, cart updates and Stripe test checkout. This item is not offered for a real purchase. منتج تجريبي لاختبار المتجر والسلة والدفع التجريبي، وليس معروضًا للبيع الحقيقي.",
        images: [`/assets/images/pro3/${image}`],
      } }, { upsert: true, runValidators: true });
    }
    console.log("Staging catalog ready: 6 explicitly tagged test products; existing stock preserved.");
  } finally {
    await mongoose.disconnect();
  }
}
if (require.main === module) seedStaging().catch(error => { console.error("Staging catalog initialization failed:", error.message); process.exitCode = 1; });
module.exports = { seedStaging };
