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
    stockQuantity: { type: Number, required: true },
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
      default: "active",
    },
    images: {
      type: [String],
      validate: {
        validator: (v) => v.length <= 5,
        message: "Exceeds the limit of 5 images",
      },
    },
  },
  { timestamps: true }
);

const PhysicalProduct = mongoose.model(
  "PhysicalProduct",
  physicalProductSchema
);

module.exports = PhysicalProduct;
