const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        productType: {
          type: String,
          enum: ["PHYSICAL", "DIGITAL"],
          required: true,
        },
        productId: {
          type: Schema.Types.ObjectId,
          refPath: "products.productType",
          required: true,
        },
        quantity: { type: Number, default: 1 },
      },
    ],
    finalTotal: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "CASH_ON_DELIVERY"],
      default: "PENDING",
    },
    orderStatus: {
      type: String,
      enum: ["PENDING", "SHIPPED", "DELIVERED", "COMPLETED", "CANCELED"],
      default: "PENDING",
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    trackingNumber: { type: String },
    transaction: { type: Schema.Types.ObjectId, ref: "Transaction" },
    couponApplied: { type: Boolean, default: false },
    appliedCouponCode: { type: String },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
