const Cart = require("../../Model/cartModel"); // Assuming the Cart model is in models/Cart.js
const customerModel = require("../../Model/customerModel");
const DigitalProduct = require("../../Model/digitalProductModel");
const PhysicalProduct = require("../../Model/physicalProductModel");
const CustomError = require("../../Utilities/CustomError");

const cartResolvers = {
  Query: {
    getCart: async (_, { userId }) => {
      try {
        const cart = await Cart.findOne({ userId: userId });
        if (!cart) {
          throw new Error("Cart not found");
        }
        return cart;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    getCarts: async () => {
      try {
        const carts = await Cart.find().populate("products.ProductID");
        return carts;
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },

  Mutation: {
    createCart: async (_, { input }) => {
      try {
        const existingUser = await customerModel.findById(input.userId);
        if (!existingUser) {
          throw new CustomError("User not found");
        }

        const cartUser = await Cart.findOne({ userId: input.userId }).exec();
        if (cartUser) {
          let products = input.products;

          let image;

          const existingProducts = await PhysicalProduct.findById(
            products[0].ProductID
          );

          image = existingProducts?.images[0];
          if (!image) {
            const existingProducts = await DigitalProduct.findById(
              products[0].ProductID
            );
            image = existingProducts?.images[0];
          }

          products = products.map((product) => ({
            ...product,
            image,
          }));

          const combinedProducts = [...cartUser.products, ...products];

          const productsTotal = combinedProducts.reduce((sum, product) => {
            return sum + product.totalAmount;
          }, 0);
          cartUser.products.push(...products);
          cartUser.totalAmount = productsTotal;
          await cartUser.save();
          return cartUser;
        } else {
          let image;
          let products = input.products;

          const existingProducts = await PhysicalProduct.findById(
            products[0].ProductID
          );

          image = existingProducts?.images[0];
          if (!image) {
            const existingProducts = await DigitalProduct.findById(
              products[0].ProductID
            );
            image = existingProducts?.images[0];
          }

          products = products.map((product) => ({
            ...product,
            image,
          }));
          const newCart = new Cart(input);
          newCart.totalAmount = input.products[0].totalAmount;
          newCart.products[0].image = image;

          await newCart.save();
          return newCart;
        }
      } catch (err) {
        throw new Error(err.message);
      }
    },

    deleteCart: async (_, { cartId, productId }) => {
      try {
        const cart = await Cart.findById(cartId);
        if (!cart) {
          throw new Error("Cart not found");
        }

        const productIndex = cart.products.findIndex(
          (product) => product._id.toString() === productId
        );

        if (productIndex === -1) {
          throw new Error("Product not found in the cart");
        }

        const removedProduct = cart.products.splice(productIndex, 1)[0];
        cart.totalAmount -= removedProduct.totalAmount;

        await cart.save();

        return cart;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    updateCart: async (_, { cartId, productId, newQuantity }) => {
      try {
        const cart = await Cart.findById(cartId);
        if (!cart) {
          throw new Error("Cart not found");
        }

        const product = cart.products.find(
          (product) => product._id.toString() === productId
        );

        if (!product) {
          throw new Error("Product not found in the cart");
        }

        if (newQuantity === 0) {
          // Remove product from cart if quantity is set to 0
          cart.products = cart.products.filter(
            (product) => product._id.toString() !== productId
          );
        } else {
          // Update quantity and totalAmount if quantity is not 0
          product.quantity = newQuantity;
          product.totalAmount = product.price * product.quantity;
        }

        // Recalculate the cart's totalAmount
        cart.totalAmount = cart.products.reduce(
          (total, product) => total + product.totalAmount,
          0
        );

        await cart.save();
        return cart;
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
};

module.exports = cartResolvers;
