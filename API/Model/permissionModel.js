const mongoose = require("mongoose");
const { Schema } = mongoose;

const permissionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Permission", permissionSchema);
