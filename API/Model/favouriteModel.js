const mongoose = require("mongoose");

const favouriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "productType",
    },
    productType: {
      type: String,
      required: true,
      enum: ["PhysicalProduct", "DigitalProduct"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Favourite", favouriteSchema);
