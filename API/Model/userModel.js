const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  authVersion: { type: Number, default: 0, min: 0 },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  role: { type: String, enum: ["Admin", "User"], required: true, default: "User" },
  image: { type: String }, // Optional
  permissions: [{ type: mongoose.Schema.ObjectId, ref: "Permission" }],
});

module.exports = mongoose.model("User", userSchema);
