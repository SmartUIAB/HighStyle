const Stripe = require("stripe");
const stripe = new Stripe(
  "sk_test_51NzFdCSCDT42kkid2TDRj7EniJjJYo4RwYHKecRzS7G7v2oSckRk5u0eFULCk8MlDguedWSiYZ10tVK9kyDbMbA700FfjhSWZZ"
);
const Cart = require("../../Model/cartModel");
const Customer = require("../../Model/customerModel");
const Order = require("../../Model/orderModel");
const CustomError = require("../../Utilities/CustomError");

const orderResolvers = {
  Mutation: {
    AddOrder: async (_, { customerId, cartId }) => {
      try {
        const customer = await Customer.findById(customerId);
        if (!customer) {
          throw new CustomError("Customer not found");
        }

        const cart = await Cart.findById(cartId);
        if (!cart) {
          throw new CustomError("Cart not found");
        }

        const products = cart?.products?.map((item) => ({
          productType: "PHYSICAL",
          productId: item?.ProductID,
          quantity: item?.quantity,
        }));
        const totalQuantity = cart?.products?.reduce(
          (sum, item) => sum + item?.quantity,
          0
        );

        const orderData = {
          cart: cart?.id,
          customer: customerId,
          products: products,
          finalTotal: cart.totalAmount,
          paymentStatus: "PENDING",
          orderStatus: "PENDING",
          shippingAddress: {
            street: "surat",
            city: "surat",
            state: "surat",
            postalCode: "surat",
            country: "surat",
          },
          trackingNumber: "11",
          couponApplied: false,
          appliedCouponCode: "23",
        };

        const newOrder = new Order(orderData);
        const savedOrder = await newOrder.save();
        console.log("savedOrder", savedOrder);

        const stripeCustomer = await stripe.customers.create({
          email: customer.email,
        });

        const adress = {
          street: "default street",
          city: "default city",
          state: "default state",
          postalCode: "000000",
          country: "India",
        };

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
          success_url: `http://localhost:3000/page/account/cart`,
          cancel_url: `http://localhost:3000/page/account`,
          customer: stripeCustomer.id,
          payment_intent_data: {
            metadata: {
              orderId: savedOrder._id.toString(),
              cartId: cart?.id,
              customerId: customer?.id,

              userEmail: customer.email,
              bookingAmount: cart.totalAmount,
              bookingCurrency: "usd",
              billingAddress: JSON.stringify(adress),
              shippingAddress: JSON.stringify(adress),
            },
          },
        });

        return {
          order: "savedOrder",
          paymentIntentClientSecret: paymentLink?.url || "hello",
        };
      } catch (error) {
        console.error("Error creating order:", error);
        throw new Error(error.message);
      }
    },
  },
};

module.exports = orderResolvers;
