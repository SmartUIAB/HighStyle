const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const User = require("../Model/userModel");
const Customer = require("../Model/customerModel");

const authenticateUser = async (token) => {
  let userId = null;
  let user = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.userId) {
        userId = decoded.userId;
        user = await User.findById(userId);
      } else if (decoded.customerId) {
        userId = decoded.customerId;
        user = await Customer.findById(userId);
      }
    } catch (err) {
      console.error("Authentication error:", err);
    }
  }

  return { userId, user };
};

module.exports = { authenticateUser };
