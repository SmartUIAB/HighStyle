const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const customerSchema = new Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  authVersion: { type: Number, default: 0, min: 0 },
  resetPasswordToken: { type: String }, // Token for password reset
  resetPasswordExpire: { type: Date }, // Expiration time for the token
});

module.exports = mongoose.model("Customer", customerSchema);
