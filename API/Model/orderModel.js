const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    cart: { type: Schema.Types.ObjectId, ref: "Cart", required: false },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: false },
    products: [
      {
        productType: {
          type: String,
          enum: ["PHYSICAL", "DIGITAL"],
          required: false,
        },
        productId: {
          type: Schema.Types.ObjectId,
          required: false,
        },
        quantity: { type: Number, default: 1 },
        title: { type: String },
        unitAmountMinor: { type: Number },
        totalAmountMinor: { type: Number },
        color: { type: String },
        size: { type: String },
      },
    ],
    finalTotal: { type: Number, required: false },
    amountMinor: { type: Number, min: 0 },
    currency: { type: String, default: "usd" },
    cartVersion: { type: Number },
    checkoutKey: { type: String, unique: true, sparse: true },
    checkoutRequestKey: { type: String },
    activeCartKey: { type: String, unique: true, sparse: true },
    checkoutSessionId: { type: String, unique: true, sparse: true },
    checkoutUrl: { type: String },
    checkoutEmail: { type: String },
    checkoutSuccessUrl: { type: String },
    checkoutCancelUrl: { type: String },
    checkoutExpiresAt: { type: Date },
    checkoutCreateStartedAt: { type: Date },
    inventoryStatus: { type: String, enum: ["UNRESERVED", "RESERVED", "COMMITTED", "RELEASED"], default: "UNRESERVED" },
    inventoryReservedAt: { type: Date },
    inventoryCommittedAt: { type: Date },
    inventoryReleasedAt: { type: Date },
    inventoryReleaseReason: { type: String },
    reservationExpiresAt: { type: Date },
    reservationCheckedAt: { type: Date },
    reservationCheckAfter: { type: Date },
    reservationError: { type: String },
    paymentIntentId: { type: String, sparse: true, index: true },
    refundedAmountMinor: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "CASH_ON_DELIVERY", "PARTIALLY_REFUNDED", "REFUNDED"],
      default: "PENDING",
    },
    orderStatus: {
      type: String,
      enum: ["PENDING", "SHIPPED", "DELIVERED", "COMPLETED", "CANCELED"],
      default: "PENDING",
    },
    shippingAddress: {
      street: { type: String, required: false },
      city: { type: String, required: false },
      state: { type: String, required: false },
      postalCode: { type: String, required: false },
      country: { type: String, required: false },
    },
    trackingNumber: { type: String },
    transaction: { type: Schema.Types.ObjectId, ref: "Transaction" },
    couponApplied: { type: Boolean, default: false },
    appliedCouponCode: { type: String },
  },
  { timestamps: true }
);

orderSchema.index({ inventoryStatus: 1, reservationCheckAfter: 1 });

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
