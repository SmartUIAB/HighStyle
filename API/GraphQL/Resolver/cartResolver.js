"use strict";
const Cart = require("../../Model/cartModel");
const CustomError = require("../../Utilities/CustomError");
const { requireCustomer, requireOwnership, objectId } = require("../../Security/access");
const { priceCart, quantity } = require("../../Services/catalogPricing");

async function ownCart(cartId, context) {
  const customerId = requireCustomer(context);
  const cart = await Cart.findById(objectId(cartId, "Cart"));
  if (!cart) throw new CustomError("Cart not found", 404);
  requireOwnership(cart.userId, customerId);
  return cart;
}
async function savePriced(cart, lines) {
  const priced = await priceCart(lines);
  cart.products = priced.products;
  cart.totalAmount = priced.totalAmount;
  try { await cart.save(); } catch (error) {
    if (error.name === "VersionError") throw new CustomError("Cart changed; refresh and retry", 409);
    throw error;
  }
  return cart;
}

module.exports = {
  Query: {
    getCart: async (_, { userId }, context) => {
      requireCustomer(context, userId);
      return Cart.findOne({ userId });
    },
    getCarts: async () => Cart.find().limit(100), // Platform-admin policy applies at the schema boundary.
  },
  Mutation: {
    createCart: async (_, { input }, context) => {
      const userId = requireCustomer(context, input.userId);
      if (!Array.isArray(input.products) || !input.products.length) throw new CustomError("Cart products are required", 400);
      let cart;
      try {
        cart = await Cart.findOneAndUpdate({ userId }, { $setOnInsert: { userId, products: [], totalAmount: 0 } }, { new: true, upsert: true, runValidators: true });
      } catch (error) {
        if (error.code !== 11000) throw error;
        cart = await Cart.findOne({ userId });
      }
      return savePriced(cart, [...cart.products.map(item => item.toObject()), ...input.products]);
    },
    updateCart: async (_, { cartId, productId, newQuantity }, context) => {
      quantity(newQuantity, true);
      const cart = await ownCart(cartId, context);
      const id = objectId(productId, "Cart line");
      if (!cart.products.some(item => String(item._id) === id)) throw new CustomError("Cart line not found", 404);
      const lines = cart.products.map(item => item.toObject()).flatMap(item => String(item._id) !== id ? [item] : newQuantity === 0 ? [] : [{ ...item, quantity: newQuantity }]);
      return savePriced(cart, lines);
    },
    deleteCart: async (_, { cartId, productId }, context) => {
      const cart = await ownCart(cartId, context);
      const id = objectId(productId, "Cart line");
      if (!cart.products.some(item => String(item._id) === id)) throw new CustomError("Cart line not found", 404);
      return savePriced(cart, cart.products.filter(item => String(item._id) !== id).map(item => item.toObject()));
    },
  },
};
