const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const User = require("../Model/userModel");

const authenticateUser = async (token) => {
  let userId = null;
  let user = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
      user = await User.findById(userId);
    } catch (err) {
      console.error("Authentication error:", err);
    }
  }

  return { userId, user };
};

module.exports = { authenticateUser };
