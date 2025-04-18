const mongoose = require("mongoose");
const { Schema } = mongoose;

const mediaSchema = new Schema(
  {
    fileName: {
      type: String,
    },
    filePath: {
      type: String,
    },
    fileType: {
      type: String,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  { timestamps: true }
);

const Media = mongoose.model("Media", mediaSchema);
module.exports = Media;
