const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const User = require("../../Model/userModel");
const CustomError = require("../../Utilities/CustomError");

const userResolver = {
  Query: {
    me: async (root, args, context) => {
      if (!context.userId) {
        throw new CustomError("Not authenticated", 401);
      }
      try {
        const user = await User.findById(context.userId);
        if (!user) {
          throw new CustomError("User not found", 404);
        }
        return user;
      } catch (error) {
        console.error("Error fetching user:", error);
        throw new CustomError(error.message, 500);
      }
    },
  },

  Mutation: {
    /* ------------------------------ For register ------------------------------ */
    register: async (root, { input }, context) => {
      const { email, password } = input;
      try {
        let user = await User.findOne({ email });
        if (user) {
          throw new CustomError("User already exists", 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({ email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user.id }, JWT_SECRET, {
          expiresIn: "2h",
        });

        context.res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 2 * 60 * 60 * 1000,
          path: "/",
        });

        return { user, token };
      } catch (error) {
        throw new CustomError(error.message, 500);
      }
    },
    /* -------------------------------- For login ------------------------------- */
    login: async (root, { email, password, rememberMe }, context) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          throw new CustomError("User not found with this email", 404);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          throw new CustomError("Invalid credentials", 401);
        }

        const tokenExpiration = rememberMe ? "2d" : "2h";
        console.log(rememberMe, " $rememberMe");

        const token = jwt.sign({ id: user.id }, JWT_SECRET, {
          expiresIn: tokenExpiration,
        });

        context.res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: rememberMe ? 2 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000,
          path: "/",
        });

        return { user, token };
      } catch (error) {
        console.error("Error logging in:", error);
        throw new CustomError(error.message, 500);
      }
    },
    /* ------------------------------- For logout ------------------------------- */
    logout: async (root, args, context) => {
      try {
        context.res.clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
        });
        return true;
      } catch (error) {
        console.error("Error logging out:", error);
        throw new CustomError("Error during logout", 500);
      }
    },
  },
};

module.exports = userResolver;
