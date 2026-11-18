"use strict";
const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  _id: { type: String, required: true },
  type: { type: String, required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  processedAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("PaymentEvent", schema);
