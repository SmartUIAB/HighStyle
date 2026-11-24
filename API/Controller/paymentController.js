"use strict";
const { getStripe } = require("../Services/stripeClient");
const { applyPaymentEvent } = require("../Services/paymentSettlement");

function createWebhookHandler({ stripe = getStripe, settle = applyPaymentEvent, secret = () => process.env.STRIPE_WEBHOOK_SECRET } = {}) {
  return async (req, res) => {
    const signingSecret = secret();
    if (!signingSecret) return res.status(503).json({ message: "Webhook verification is not configured" });
    if (!Buffer.isBuffer(req.body) || typeof req.headers["stripe-signature"] !== "string") return res.status(400).json({ message: "A signed raw payment event is required" });
    let event;
    try { event = stripe().webhooks.constructEvent(req.body, req.headers["stripe-signature"], signingSecret); }
    catch (_) { return res.status(400).json({ message: "Invalid payment signature" }); }
    try {
      const result = await settle(event);
      return res.status(200).json({ received: true, ...result });
    } catch (error) {
      const status = [400, 409, 503].includes(error.statusCode) ? error.statusCode : 503;
      console.error("Payment event processing failed", { eventId: event.id, code: error.code || status });
      return res.status(status).json({ message: status === 400 ? "Payment validation failed" : "Payment processing unavailable; retry required" });
    }
  };
}

module.exports = { handleWebhook: createWebhookHandler(), createWebhookHandler };
