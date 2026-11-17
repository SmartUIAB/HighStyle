"use strict";
const express = require("express");
const { handleWebhook } = require("../Controller/paymentController");
const wrapAsync = require("../Utilities/wrapAsync");
const router = express.Router();
// Must be mounted before express.json(): signature verification needs the exact bytes.
router.post("/webhook", express.raw({ type: "application/json", limit: "1mb" }), wrapAsync(handleWebhook));
module.exports = router;
