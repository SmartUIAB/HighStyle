"use strict";
const { cookieOptions, validatePassword } = require("../../Security/http");
const Customer = require("../../Model/customerModel");
const CustomError = require("../../Utilities/CustomError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");
const sendEmail = require("../../Utilities/sendEmail");
const { checkoutUrls } = require("../../Services/checkout");
const resetMessage = { message: "If this account exists, password reset instructions will be sent." };

function emailAddress(value) {
  if (typeof value !== "string" || value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) throw new CustomError("A valid email address is required", 400);
  return value.trim();
}
function customerName(value) {
  if (typeof value !== "string" || !value.trim() || value.length > 100) throw new CustomError("A valid name is required", 400);
  return value.trim();
}
const customerResolver = {
  Mutation: {
    loginCustomer: async (_, { email, password }, context) => {
      const customer = await Customer.findOne({ email: emailAddress(email) });
      if (!customer || typeof password !== "string" || !(await bcrypt.compare(password, customer.password))) throw new CustomError("Invalid credentials", 401);
      const token = jwt.sign({ customerId: customer._id, authVersion: customer.authVersion || 0 }, process.env.JWT_SECRET, { expiresIn: "2d", algorithm: "HS256" });
      context.res.cookie("token", token, cookieOptions(2 * 24 * 60 * 60 * 1000));
      return { customer, token };
    },
    createCustomer: async (_, { input, password }) => {
      validatePassword(password);
      const data = { firstname: customerName(input.firstname), lastname: customerName(input.lastname), email: emailAddress(input.email) };
      if (await Customer.exists({ email: data.email })) throw new CustomError("Registration could not be completed for this email", 400);
      try {
        const customer = await Customer.create({ ...data, password: await bcrypt.hash(password, 10) });
        return { id: customer._id, ...data };
      } catch (error) {
        if (error.code === 11000) throw new CustomError("Registration could not be completed for this email", 400);
        throw error;
      }
    },
    forgetPassword: async (_, { email }) => {
      const customer = await Customer.findOne({ email: emailAddress(email) });
      if (!customer) return resetMessage;
      const token = crypto.randomBytes(32).toString("hex");
      const digest = crypto.createHash("sha256").update(token).digest("hex");
      // Reuse the validated configured origin, never a request-supplied redirect.
      const resetUrl = new URL(`/en/page/account/password-reset/${token}`, checkoutUrls("en").success_url).href;
      await Customer.updateOne({ _id: customer._id }, { $set: { resetPasswordToken: digest, resetPasswordExpire: Date.now() + 15 * 60 * 1000 } });
      try {
        await sendEmail({ to: customer.email, subject: "Password Reset", text: `Use this link to reset your password: ${resetUrl}` });
      } catch (_) {
        // Do not clear a newer concurrent reset request or expose account existence.
        await Customer.updateOne({ _id: customer._id, resetPasswordToken: digest }, { $unset: { resetPasswordToken: 1, resetPasswordExpire: 1 } });
        console.error("Password reset delivery failed");
      }
      return resetMessage;
    },
    resetPassword: async (_, { token, newPassword }) => {
      validatePassword(newPassword);
      if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) throw new CustomError("Invalid or expired password reset token", 400);
      const digest = crypto.createHash("sha256").update(token).digest("hex");
      const password = await bcrypt.hash(newPassword, 10);
      // Consume exactly once and revoke existing tokens in the same atomic write.
      const customer = await Customer.findOneAndUpdate({ resetPasswordToken: digest, resetPasswordExpire: { $gt: Date.now() } }, {
        $set: { password }, $unset: { resetPasswordToken: 1, resetPasswordExpire: 1 }, $inc: { authVersion: 1 },
      }, { new: true, runValidators: true });
      if (!customer) throw new CustomError("Invalid or expired password reset token", 400);
      return { message: "Password reset successfully" };
    },
  },
};
module.exports = customerResolver;
