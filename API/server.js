"use strict";
require("dotenv").config();
const mongoose = require("mongoose");
const { createServer } = require("node:http");
const DatabaseConnection = require("./Config/DataBase");
const { createApp } = require("./app");

async function startServer() {
  if (!process.env.JWT_SECRET || (process.env.NODE_ENV === "production" && process.env.JWT_SECRET.length < 32)) throw new Error("A strong JWT_SECRET is required");
  require("./Security/paymentPolicy").paymentPolicy();
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
  const transporter = require("./Services/mailTransport").createMailTransport();
  if (transporter) {
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
  let reservationTimer;
  if (process.env.PAYMENTS_ENABLED === "true") {
    let reconciling = false;
    const reconcile = async () => {
      if (reconciling) return;
      reconciling = true;
      try { await require("./Services/reservationReconciliation").reconcileReservations({ limit: 20 }); }
      catch (error) { console.error("Inventory reconciliation failed", error.code || "UNAVAILABLE"); }
      finally { reconciling = false; }
    };
    reservationTimer = setInterval(reconcile, 60000);
    reservationTimer.unref();
    void reconcile();
  }
  async function stop() {
    clearInterval(receiptTimer);
    clearInterval(reservationTimer);
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
