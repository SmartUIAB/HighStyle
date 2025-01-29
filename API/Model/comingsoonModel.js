// models/ComingSoon.js
const mongoose = require("mongoose");

const ComingSoonSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Ensure no duplicate emails
    trim: true,
    lowercase: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ComingSoon", ComingSoonSchema);
