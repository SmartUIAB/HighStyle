"use strict";
const nodemailer = require("nodemailer");

function mailOptions(env = process.env) {
  if (!env.SMTP_HOST) return null;
  const port = Number(env.SMTP_PORT || 587);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid SMTP_PORT");
  if (Boolean(env.USER_EMAIL_PASSWORD) && !env.USER_EMAIL) throw new Error("SMTP user is required");
  return {
    host: env.SMTP_HOST, port, secure: env.SMTP_SECURE === "true" || port === 465,
    ...(env.USER_EMAIL_PASSWORD ? { auth: { user: env.USER_EMAIL, pass: env.USER_EMAIL_PASSWORD } } : {}),
    connectionTimeout: 10000, socketTimeout: 30000,
  };
}
function createMailTransport(env = process.env) {
  const options = mailOptions(env);
  return options ? nodemailer.createTransport(options) : null;
}
module.exports = { mailOptions, createMailTransport };
