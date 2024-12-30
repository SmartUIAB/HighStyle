const express = require("express");
const {
  handleWebhook,
  createPaymentIntent,
} = require("../Controller/paymentController");
const wrapAsync = require("../Utilities/wrapAsync");
const bodyParser = require("body-parser");

const router = express.Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  wrapAsync(handleWebhook)
);
router.post("/", wrapAsync(createPaymentIntent));

module.exports = router;
