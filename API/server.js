"use strict";
require("dotenv").config();
const mongoose = require("mongoose");
const { createServer } = require("node:http");
const DatabaseConnection = require("./Config/DataBase");
const { createApp } = require("./app");

async function startServer() {
  if (!process.env.JWT_SECRET || (process.env.NODE_ENV === "production" && process.env.JWT_SECRET.length < 32)) throw new Error("A strong JWT_SECRET is required");
  const port = Number(process.env.PORT || 2024);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
  await DatabaseConnection();
  const hello = await mongoose.connection.db.admin().command({ hello: 1 });
  if (process.env.PAYMENTS_ENABLED === "true") {
    if (!hello.setName && hello.msg !== "isdbgrid") throw new Error("Payments require MongoDB transactions (replica set or sharded cluster)");
    for (const key of ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "FRONTEND_URL"]) if (!process.env[key]) throw new Error(`${key} is required for checkout`);
    require("./Services/stripeClient").getStripe();
  }
  await Promise.all([require("./Model/cartModel").init(), require("./Model/orderModel").init(), require("./Model/transactionModel").init(), require("./Model/paymentEventModel").init(), require("./Model/receiptOutboxModel").init()]);
  const { app, server } = await createApp();
  const http = createServer(app);
  await new Promise((resolve, reject) => { http.once("error", reject); http.listen(port, resolve); });
  let receiptTimer;
  if (process.env.USER_EMAIL && process.env.USER_EMAIL_PASSWORD) {
    const transporter = require("nodemailer").createTransport({ service: "gmail", auth: { user: process.env.USER_EMAIL, pass: process.env.USER_EMAIL_PASSWORD }, connectionTimeout: 10000, socketTimeout: 30000 });
    let busy = false;
    receiptTimer = setInterval(async () => {
      if (busy) return;
      busy = true;
      try { await require("./Services/receiptOutbox").dispatchReceipts(transporter); }
      catch (error) { console.error("Receipt dispatcher failed", error.code || "UNAVAILABLE"); }
      finally { busy = false; }
    }, 15000);
    receiptTimer.unref();
  }
  async function stop() {
    clearInterval(receiptTimer);
    await new Promise(resolve => http.close(resolve));
    await server.stop();
    await mongoose.disconnect();
  }
  process.once("SIGTERM", () => { stop().catch(() => { process.exitCode = 1; }); });
  process.once("SIGINT", () => { stop().catch(() => { process.exitCode = 1; }); });
  console.log(`HighStyle API listening on port ${port}`);
  return { http, server, stop };
}
if (require.main === module) startServer().catch(async error => { console.error("API startup failed:", error.message); await mongoose.disconnect(); process.exitCode = 1; });
module.exports = { startServer };
