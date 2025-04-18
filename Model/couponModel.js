const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  allowFreeShipping: {
    type: Boolean,
    default: false,
  },
  quantity: {
    type: Number,
    required: true,
  },
  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
  },
  // Restriction fields
  minSpend: {
    type: Number,
    default: 0,
  },
  maxSpend: {
    type: Number,
    default: 0,
  },
  restrictionProducts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  usageLimit: {
    type: Number,
  },
  perCustomerLimit: {
    type: Number,
  },
  statusActive: {
    type: Boolean,
    default: false,
  },
});

const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon;
