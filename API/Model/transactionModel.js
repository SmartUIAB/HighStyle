const mongoose = require("mongoose");
const { Schema } = mongoose;

const transactionSchema = new Schema({
  order: {
    type: Schema.Types.ObjectId,
    ref: "Order",
    unique: true,
    required: true,
  },
  user: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
  transactionAmount: { type: Number, required: true },
  transactionStatus: {
    type: String,
    enum: ["PENDING", "SUCCESSFUL", "FAILED", "PARTIALLY_REFUNDED", "REFUNDED"],
    default: "PENDING",
  },
  paymentGateway: { type: String, required: true },
  transactionId: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
