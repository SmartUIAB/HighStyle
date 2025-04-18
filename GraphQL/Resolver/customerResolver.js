const Customer = require("../../Model/customerModel");
const CustomError = require("../../Utilities/CustomError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const crypto = require("crypto");
const sendEmail = require("../../Utilities/sendEmail");

const customerResolver = {
  Mutation: {
    loginCustomer: async (root, { email, password }, context) => {
      try {
        const customer = await Customer.findOne({ email });

        if (!customer) {
          throw new CustomError("Customer not found with this email", 404);
        }

        const isMatch = await bcrypt.compare(password, customer.password);
        if (!isMatch) {
          throw new CustomError("Invalid credentials", 401);
        }

        const tokenExpiration = "2d";

        const token = jwt.sign({ customerId: customer._id }, JWT_SECRET, {
          expiresIn: tokenExpiration,
        });

        context.res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 2 * 24 * 60 * 60 * 1000,
          path: "/",
        });

        context.res.cookie("CustomerDetails", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 2 * 24 * 60 * 60 * 1000,
          path: "/",
        });

        return { customer, token };
      } catch (error) {
        console.error("Error logging in:", error);
        throw new CustomError(error.message, 500);
      }
    },
    createCustomer: async (_, { input, password }) => {
      const { firstname, lastname, email } = input;

      try {
        let existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
          throw new CustomError("Customer already exists with this email", 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newCustomer = await Customer.create({
          firstname,
          lastname,
          email,
          password: hashedPassword,
        });

        return {
          id: newCustomer._id,
          firstname: newCustomer.firstname,
          lastname: newCustomer.lastname,
          email: newCustomer.email,
        };
      } catch (error) {
        throw new CustomError(
          error.message || "An error occurred while creating the customer",
          500
        );
      }
    },
    forgetPassword: async (_, { email }) => {
      try {
        const customer = await Customer.findOne({ email });

        if (!customer) {
          throw new CustomError("Customer not found with this email", 404);
        }

        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto
          .createHash("sha256")
          .update(resetToken)
          .digest("hex");

        // Set token and expiration in the database
        customer.resetPasswordToken = hashedToken;
        customer.resetPasswordExpire = Date.now() + 5 * 60 * 1000; // 5 minutes
        await customer.save();

        // Send email
        const resetUrl = `${process.env.FRONTEND_URL}/en/page/account/password-reset/${resetToken}`;
        const message = `You are receiving this email because you requested a password reset. Click the link to reset your password: ${resetUrl}`;

        await sendEmail({
          to: customer.email,
          subject: "Password Reset",
          text: message,
        });

        return {
          message: "Password reset link sent to your email",
        };
      } catch (error) {
        console.error("Error in forgetPassword:", error);
        throw new CustomError(
          error.message || "Failed to process the request",
          500
        );
      }
    },
    resetPassword: async (_, { token, newPassword }) => {
      try {
        // Hash the received token for comparison
        const hashedToken = crypto
          .createHash("sha256")
          .update(token)
          .digest("hex");

        // Find the customer with the hashed token and ensure the token is still valid
        const customer = await Customer.findOne({
          resetPasswordToken: hashedToken,
          resetPasswordExpire: { $gt: Date.now() },
        });

        if (!customer) {
          throw new CustomError("Invalid or expired password reset token", 400);
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the customer's password and clear the reset token/expiration
        customer.password = hashedPassword;
        customer.resetPasswordToken = undefined;
        customer.resetPasswordExpire = undefined;

        await customer.save();

        return {
          message: "Password reset successfully",
        };
      } catch (error) {
        console.error("Error in resetPassword:", error);
        throw new CustomError(
          error.message || "Failed to reset the password",
          500
        );
      }
    },
  },
};

module.exports = customerResolver;
