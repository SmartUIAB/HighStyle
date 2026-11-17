"use strict";
const mongoose = require("mongoose");
async function DatabaseConnection() {
  if (!process.env.MONGODB_ATLAS) throw new Error("MONGODB_ATLAS is required");
  return mongoose.connect(process.env.MONGODB_ATLAS, { serverSelectionTimeoutMS: 10000 });
}
module.exports = DatabaseConnection;
