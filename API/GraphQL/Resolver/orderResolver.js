const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Cart = require("../../Model/cartModel");
const Customer = require("../../Model/customerModel");
const Order = require("../../Model/orderModel");
const CustomError = require("../../Utilities/CustomError");
const PhysicalProduct = require("../../Model/physicalProductModel");

const orderResolvers = {
  Query: {
    GetMyOrder: async (_, { customerId }) => {
      try {
        const customer = await Customer.findById(customerId);
        if (!customer) {
          throw new CustomError("Customer not found", 404);
        }

        const orders = await Order.find({ customer: customerId })
          .populate("customer", "name email")
          .populate("products.productId", "name price description");

        return orders;
      } catch (error) {
        console.error(error);
        throw new CustomError(
          error.message || "Error fetching orders",
          error.statusCode || 500
        );
      }
    },
  },
  Mutation: {
    AddOrder: async (_, { customerId, cartId, shippingAddress }) => {
      try {
        const customer = await Customer.findById(customerId);
        if (!customer) {
          throw new CustomError("Customer not found");
        }

        const cart = await Cart.findById(cartId);
        if (!cart) {
          throw new CustomError("Cart not found");
        }

        const physicalProducts = await PhysicalProduct.find();

        const physicalProductIds = physicalProducts.map((physical) =>
          physical._id.toString()
        );

        const products = cart?.products?.map((item) => {
          const isPhysical = physicalProductIds.some(
            (id) => id === item.ProductID.toString()
          );

          return {
            productType: isPhysical ? "PHYSICAL" : "DIGITAL",
            productId: item?.ProductID,
            quantity: item?.quantity,
          };
        });

        const orderData = {
          cart: cart?.id,
          customer: customerId,
          products: products,
          finalTotal: cart.totalAmount,
          paymentStatus: "PENDING",
          orderStatus: "PENDING",
          shippingAddress: shippingAddress,
          trackingNumber: "11",
          couponApplied: false,
          appliedCouponCode: "23",
        };

        const newOrder = new Order(orderData);
        const savedOrder = await newOrder.save();

        const stripeCustomer = await stripe.customers.create({
          email: customer.email,
        });

        const paymentLink = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: "Order",
                },
                unit_amount: Math.round(cart.totalAmount * 100),
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `http://localhost:3000/en/page/order-success`,
          cancel_url: `http://localhost:3000/en/page/account/cart`,
          customer: stripeCustomer.id,
          metadata: {
            orderId: savedOrder._id.toString(),
            cartId: cart?.id,
            customerId: customer?.id,
            userEmail: customer.email,
            bookingAmount: cart.totalAmount,
            bookingCurrency: "usd",
            billingAddress: JSON.stringify(shippingAddress),
            shippingAddress: JSON.stringify(shippingAddress),
          },
        });

        return {
          order: "savedOrder",
          paymentIntentClientSecret: paymentLink.url,
        };
      } catch (error) {
        console.error("Error creating order:", error);
        throw new Error(error.message);
      }
    },
  },
};

module.exports = orderResolvers;
