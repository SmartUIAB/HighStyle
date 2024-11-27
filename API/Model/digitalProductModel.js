const mongoose = require("mongoose");
const { Schema } = mongoose;

const digitalProductSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    subcategory: { type: Schema.Types.ObjectId, ref: "Subcategory" },
    SKU: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    licenseType: {
      type: String,
      enum: ["single_use", "multi_use", "lifetime"],
      required: true,
    },
    fileFormat: { type: String, required: true },
    fileSize: { type: String, required: true },
    version: { type: String, default: "0.0.0" },
    compatibility: { type: [String] },
    tags: { type: [String] },
    metaTitle: { type: String },
    metaDescription: { type: String },
    status: {
      type: String,
      enum: ["Available", "Unavailable"],
      default: "active",
    },
    images: {
      type: [String],
      validate: {
        validator: (v) => v.length <= 5,
        message: "Exceeds the limit of 5 images",
      },
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  { timestamps: true }
);

const DigitalProduct = mongoose.model("DigitalProduct", digitalProductSchema);
module.exports = DigitalProduct;
