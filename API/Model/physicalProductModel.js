const mongoose = require("mongoose");
const { Schema } = mongoose;

const physicalProductSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    subcategory: { type: Schema.Types.ObjectId, ref: "Subcategory" },
    SKU: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    // On-hand stock includes units held by an unfinished checkout.
    stockQuantity: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
    reservedQuantity: { type: Number, default: 0, min: 0, validate: Number.isSafeInteger },
    metaTitle: { type: String },
    metaDescription: { type: String },
    colors: { type: [String] },
    sizes: {
      type: [String],
      default: [],
    },
    tags: { type: [String] },
    status: {
      type: String,
      enum: ["Available", "Unavailable"],
      default: "Available",
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
  { timestamps: true, optimisticConcurrency: true }
);

physicalProductSchema.pre("validate", function () {
  if (this.reservedQuantity > this.stockQuantity) {
    this.invalidate("stockQuantity", "Stock cannot be lower than the quantity reserved by checkouts");
  }
});

const PhysicalProduct = mongoose.model(
  "PhysicalProduct",
  physicalProductSchema
);

module.exports = PhysicalProduct;
