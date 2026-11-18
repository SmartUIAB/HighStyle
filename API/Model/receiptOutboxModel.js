"use strict";
const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  _id: { type: String, required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  status: { type: String, enum: ["pending", "processing", "sent", "failed"], default: "pending" },
  attempts: { type: Number, default: 0 },
  nextAttemptAt: { type: Date, default: Date.now },
  leaseUntil: Date,
  claimId: String,
  lastError: String,
}, { timestamps: true });
schema.index({ status: 1, nextAttemptAt: 1, leaseUntil: 1 });
module.exports = mongoose.model("ReceiptOutbox", schema);
