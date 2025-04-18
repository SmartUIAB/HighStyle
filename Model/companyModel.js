const mongoose = require("mongoose");
const { Schema } = mongoose;

const companySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, // Ensures company names are unique
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
