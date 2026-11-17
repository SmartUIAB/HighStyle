const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Customer", required: true, unique: true },
    products: [
      {
        ProductID: {
          type: Schema.Types.ObjectId,
        },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        color: { type: String },
        size: { type: String },
        totalAmount: { type: Number, required: true },
        image: { type: String, required: false },
      },
    ],
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true, optimisticConcurrency: true }
);

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
