"use strict";
const { createMailTransport } = require("../Services/mailTransport");

module.exports = async function sendEmail({ to, subject, text, html }) {
  const transporter = createMailTransport();
  if (!transporter) throw new Error("Email delivery is not configured");
  try {
    await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.USER_EMAIL, to, subject, text, html });
  } catch (error) {
    console.error("Email delivery failed", error.code || "SEND_FAILED");
    throw new Error("Failed to send email. Please try again.");
  }
};
