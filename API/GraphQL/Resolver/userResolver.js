const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const User = require("../../Model/userModel");
const CustomError = require("../../Utilities/CustomError");
const { upload } = require("../../Utilities/upload");
const Company = require("../../Model/companyModel");
const Permission = require("../../Model/permissionModel");

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
    register: async (root, { input, image }, context) => {
      const { email, password, firstname, lastname, company } = input;

      try {
        let user = await User.findOne({ email });
        let imagePath = null;

        // Upload image if provided
        if (image) {
          imagePath = await upload(
            image,
            `${company.replace(/\s+/g, "")}/users`
          );
        }

        // If the user already exists, throw an error
        if (user) {
          throw new CustomError("User already exists", 400);
        }

        // Permission definitions
        const permissionsToCheck = [
          {
            name: "View Products",
            description:
              "Allows the user to view products listed on the platform.",
          },
          {
            name: "Add Products",
            description: "Allows the user to add new products to the catalog.",
          },
          {
            name: "Edit Products",
            description: "Allows the user to edit product details.",
          },
          {
            name: "Delete Products",
            description: "Allows the user to remove products from the catalog.",
          },
          {
            name: "View Orders",
            description: "Allows the user to view order details.",
          },
          {
            name: "Manage Orders",
            description: "Allows the user to process and update orders.",
          },
          {
            name: "View Users",
            description: "Allows the user to view customer and admin profiles.",
          },
          {
            name: "Manage Users",
            description:
              "Allows the user to create, edit, or delete user accounts.",
          },
          {
            name: "Manage Permissions",
            description: "Allows the user to update or assign permissions.",
          },
          {
            name: "View Reports",
            description:
              "Allows the user to view sales and performance reports.",
          },
          {
            name: "Manage Discounts",
            description:
              "Allows the user to create or edit discount codes and promotions.",
          },
          {
            name: "Access Settings",
            description:
              "Allows the user to access and update platform settings.",
          },
        ];

        // Fetch existing permissions
        const existingPermissions = await Permission.find();
        const existingPermissionNames = existingPermissions.map(
          (perm) => perm.name
        );

        const missingPermissions = permissionsToCheck.filter(
          (perm) =>
            perm.name &&
            perm.description &&
            !existingPermissionNames.includes(perm.name)
        );

        const invalidPermissions = permissionsToCheck.filter(
          (perm) => !perm.name || !perm.description
        );
        if (invalidPermissions.length > 0) {
          console.warn("Invalid permissions detected:", invalidPermissions);
        }

        if (missingPermissions.length > 0) {
          await Permission.insertMany(missingPermissions);
        }

        let companyRecord = await Company.findOne({ name: company });
        if (!companyRecord) {
          companyRecord = new Company({
            name: company,
          });
          await companyRecord.save();
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const allPermissions = await Permission.find();

        user = new User({
          email,
          password: hashedPassword,
          firstname,
          lastname,
          company: companyRecord._id,
          image: imagePath,
          permissions: allPermissions.map((perm) => perm._id),
        });

        // Save the user to the database
        await user.save();

        // Generate a token for the user
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
          expiresIn: "2h",
        });

        // Set the token as a cookie in the response
        context.res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 2 * 60 * 60 * 1000, // 2 hours
          path: "/",
        });

        // Return the user and token
        return { user, token };
      } catch (error) {
        console.error("Error during registration:", error);
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

        const token = jwt.sign({ userId: user.userId }, JWT_SECRET, {
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
