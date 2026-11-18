"use strict";
const { randomUUID } = require("node:crypto");
const ReceiptOutbox = require("../Model/receiptOutboxModel");
const Order = require("../Model/orderModel");
const Customer = require("../Model/customerModel");
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

async function dispatchReceipts(transporter, limit = 5) {
  if (!transporter) return 0;
  let sent = 0;
  for (let i = 0; i < limit; i++) {
    const now = new Date();
    const claimId = randomUUID();
    const task = await ReceiptOutbox.findOneAndUpdate({ attempts: { $lt: 10 }, $or: [
      { status: "pending", nextAttemptAt: { $lte: now } }, { status: "processing", leaseUntil: { $lte: now } },
    ] }, { $set: { status: "processing", claimId, leaseUntil: new Date(Date.now() + 300000) }, $inc: { attempts: 1 } }, { new: true, sort: { createdAt: 1 } });
    if (!task) break;
    try {
      const order = await Order.findById(task.order).lean();
      const customer = order && await Customer.findById(order.customer).lean();
      if (!customer?.email) throw Object.assign(new Error("Recipient unavailable"), { code: "RECIPIENT_UNAVAILABLE" });
      const rows = order.products.map(item => `<tr><td>${escapeHtml(item.title)}</td><td>${escapeHtml(item.quantity)}</td></tr>`).join("");
      await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.USER_EMAIL, to: customer.email,
        messageId: `<highstyle-order-${order._id}@receipts.highstyle.invalid>`, subject: "HighStyle payment confirmation",
        html: `<h1>Payment received</h1><p>Order ${escapeHtml(order._id)}</p><table>${rows}</table><p>Paid: USD ${(order.amountMinor / 100).toFixed(2)}</p>`,
      });
      await ReceiptOutbox.updateOne({ _id: task._id, claimId }, { $set: { status: "sent", leaseUntil: null, lastError: null } });
      sent++;
    } catch (error) {
      await ReceiptOutbox.updateOne({ _id: task._id, claimId }, { $set: {
        status: task.attempts >= 10 ? "failed" : "pending", leaseUntil: null,
        nextAttemptAt: new Date(Date.now() + Math.min(3600000, 1000 * 2 ** task.attempts)), lastError: String(error.code || "SEND_FAILED"),
      } });
    }
  }
  return sent;
}
module.exports = { dispatchReceipts, escapeHtml };
