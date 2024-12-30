const Cart = require("../Model/cartModel");
const Order = require("../Model/orderModel");
const Transaction = require("../Model/transactionModel");
const Stripe = require("stripe");
const stripe = Stripe(
  "sk_test_51NzFdCSCDT42kkid2TDRj7EniJjJYo4RwYHKecRzS7G7v2oSckRk5u0eFULCk8MlDguedWSiYZ10tVK9kyDbMbA700FfjhSWZZ"
);

const handleWebhook = async (req, res, next) => {
  let data, eventType;

  /* ---------------- Verify the webhook signature from Stripe ---------------- */
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    const signature = req.headers["stripe-signature"];
    let event = req.body;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log("Webhook signature verification failed:", err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    data = event.data.object;
    eventType = event.type;
  } else {
    data = req.body.data.object;
    eventType = req.body.type;
  }

  const paymentIntent = data;
  const orderId = paymentIntent.metadata?.orderId;

  try {
    let updatedOrder, newTransaction;

    /* ---------- Handle different Stripe event types ---------- */
    switch (eventType) {
      // Checkout session completed
      case "checkout.session.completed":
        // Extract order ID from metadata
        const session = data;
        const sessionOrderId = session.metadata?.orderId;

        if (session.payment_status === "paid") {
          updatedOrder = await Order.findByIdAndUpdate(
            sessionOrderId,
            {
              paymentStatus: "PAID",
              orderStatus: "SHIPPED",
            },
            { new: true }
          );

          newTransaction = new Transaction({
            order: updatedOrder?._id,
            user: updatedOrder?.customer,
            transactionAmount: session.amount_total / 100,
            paymentGateway: "Stripe",
            transactionStatus: "SUCCESSFUL",
            transactionId: session.payment_intent,
          });
          await newTransaction.save();
          await Cart.findByIdAndDelete(updatedOrder.cart);

          console.log("✅ Checkout session completed, order updated!");
        } else {
          updatedOrder = await Order.findByIdAndUpdate(
            sessionOrderId,
            {
              paymentStatus: "FAILED",
              orderStatus: "CANCELLED",
            },
            { new: true }
          );

          newTransaction = new Transaction({
            order: updatedOrder._id,
            transactionAmount: session.amount_total / 100,
            paymentGateway: "Stripe",
            transactionStatus: "FAILED",
            transactionId: session.payment_intent,
          });
          await newTransaction.save();

          console.log("❌ Checkout session failed, order updated!");
        }
        break;

      // Payment intent succeeded
      case "payment_intent.succeeded":
        updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          {
            paymentStatus: "PAID",
            orderStatus: "SHIPPED",
          },
          { new: true }
        );

        newTransaction = new Transaction({
          order: updatedOrder._id,
          user: updatedOrder.user,
          transactionAmount: paymentIntent.amount / 100,
          paymentGateway: "Stripe",
          transactionStatus: "SUCCESSFUL",
          transactionId: paymentIntent.id,
        });
        await newTransaction.save();

        console.log("✅ Payment succeeded and order updated!");
        break;

      // Payment intent failed
      case "payment_intent.payment_failed":
        updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          {
            paymentStatus: "FAILED",
            orderStatus: "CANCELLED",
          },
          { new: true }
        );

        newTransaction = new Transaction({
          order: updatedOrder._id,
          transactionAmount: paymentIntent.amount / 100,
          paymentGateway: "Stripe",
          transactionStatus: "FAILED",
          transactionId: paymentIntent.id,
        });
        await newTransaction.save();

        console.log("❌ Payment failed and order updated!");
        break;

      // Payment intent canceled
      case "payment_intent.canceled":
        updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          {
            paymentStatus: "CANCELLED",
            orderStatus: "CANCELLED",
          },
          { new: true }
        );

        newTransaction = new Transaction({
          order: updatedOrder._id,
          transactionAmount: paymentIntent.amount / 100,
          paymentGateway: "Stripe",
          transactionStatus: "CANCELLED",
          transactionId: paymentIntent.id,
        });
        await newTransaction.save();

        console.log("⚠️ Payment intent was canceled and order updated!");
        break;

      // Refund event (charge refunded)
      case "charge.refunded":
        updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          {
            paymentStatus: "REFUNDED",
            orderStatus: "REFUNDED",
          },
          { new: true }
        );

        newTransaction = new Transaction({
          order: updatedOrder._id,
          transactionAmount: paymentIntent.amount / 100,
          paymentGateway: "Stripe",
          transactionStatus: "REFUNDED",
          transactionId: paymentIntent.id,
        });
        await newTransaction.save();

        console.log("🔄 Payment refunded and order updated!");
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    /* ----- Respond with a 200 status to acknowledge receipt of the webhook ---- */
    res.status(200).send();
  } catch (err) {
    console.error("::::::::::Error in webhook event::::::::::", err.message);
    res.status(500).send();
  }
};

module.exports = { handleWebhook };
