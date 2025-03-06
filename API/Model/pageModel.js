const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: Boolean, required: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Page", pageSchema);
