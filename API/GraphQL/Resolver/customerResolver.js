const Customer = require("../../Model/customerModel");
const CustomError = require("../../Utilities/CustomError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

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
  },
};

module.exports = customerResolver;
