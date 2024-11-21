const Order = require("../Model/orderModel");
const Transaction = require("../Model/transactionModel");
const Stripe = require("stripe");
const stripe = Stripe(
  "sk_test_51PKusfSF45ceFcmoNjxILNypOpmyM12iZCIMU9nsvWA9LD3qmATfJCoIfygNecX95pp1slJMjOIWFifaiuQNZpOa00D5A3D3f6"
);

const handleWebhook = async (req, res, next) => {
  let data, eventType;
  /* ---------------- Verify the webhook signature from Stripe ---------------- */
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    const signature = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    data = event.data.object;
    eventType = event.type;
  } else {
    data = req.body.data.object;
    eventType = req.body.type;
  }

  const paymentIntent = data;
  const orderId = paymentIntent.metadata.orderId;

  try {
    let updatedOrder, newTransaction;

    /* ---------- Dynamically determine the status based on event type ---------- */
    switch (eventType) {
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

        console.log("✅ Payment received and order updated!");
        break;

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

      // Handle other event types, such as refunds
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

const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency, orderId, userId, shippingAddress } = req.body;

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: currency,
      payment_method_types: ["card"],
      metadata: {
        orderId: orderId,
        userId: userId,
      },
    });
    const addressString = `${shippingAddress.name}, ${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.postalCode}, ${shippingAddress.country}, Phone: ${shippingAddress.phone}`;
    // Create a checkout session (for link-based payment)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: "Payment for Order",
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:3000/en/dashboard",
      cancel_url: "http://localhost:3000/en/dashboard",
      metadata: {
        orderId: orderId,
        userId: userId,
        shipping_address: addressString,
      },
    });

    res.json({ paymentLink: session.url });
  } catch (error) {
    console.error("Error creating:------:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { handleWebhook, createPaymentIntent };
