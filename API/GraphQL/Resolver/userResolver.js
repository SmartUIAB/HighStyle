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
    userlist: async (root, args, context) => {
      if (!context.userId) {
        throw new CustomError("Not authenticated", 401);
      }
      try {
        const user = await User.find({ role: "User" });
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
            module: "Products",
            name: "View Products",
            description:
              "Allows the user to view products listed on the platform.",
          },
          {
            module: "Products",
            name: "Add Products",
            description: "Allows the user to add new products to the platform.",
          },
          {
            module: "Products",
            name: "Edit Products",
            description:
              "Allows the user to edit existing products listed on the platform.",
          },
          {
            module: "Products",
            name: "Delete Products",
            description:
              "Allows the user to delete products from the platform.",
          },
          {
            module: "Orders",
            name: "View Orders",
            description:
              "Allows the user to view customer orders on the platform.",
          },
          {
            module: "Orders",
            name: "Process Orders",
            description:
              "Allows the user to process and manage customer orders.",
          },
          {
            module: "Customers",
            name: "View Customers",
            description:
              "Allows the user to view customer details and information.",
          },
          {
            module: "Customers",
            name: "Add Customers",
            description:
              "Allows the user to add new customers to the platform.",
          },
          {
            module: "Customers",
            name: "Edit Customers",
            description: "Allows the user to edit customer information.",
          },
          {
            module: "Customers",
            name: "Delete Customers",
            description:
              "Allows the user to delete customer information from the platform.",
          },
          {
            module: "Reports",
            name: "View Reports",
            description: "Allows the user to view sales and financial reports.",
          },
          {
            module: "Reports",
            name: "Generate Reports",
            description:
              "Allows the user to generate new sales and financial reports.",
          },
          {
            module: "Reports",
            name: "Export Reports",
            description:
              "Allows the user to export reports to external formats.",
          },
          {
            module: "Payments",
            name: "Manage Payments",
            description: "Allows the user to process payments and refunds.",
          },
          {
            module: "Shipping",
            name: "View Shipping",
            description:
              "Allows the user to view shipping details and tracking.",
          },
          {
            module: "Shipping",
            name: "Manage Shipping",
            description:
              "Allows the user to manage shipping options and dispatch products.",
          },
          {
            module: "Inventory",
            name: "Manage Inventory",
            description:
              "Allows the user to manage inventory levels and stock.",
          },
          {
            module: "Inventory",
            name: "View Inventory",
            description:
              "Allows the user to view the inventory status and product availability.",
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
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
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

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
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
    createUser: async (_, { input, image }, context) => {
      const { email, password, firstname, lastname, permissions } = input;
      try {
        let company = await Company.findById(context.user.company);
        if (!company) {
          throw new CustomError("Company not found", 404);
        }

        let existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new CustomError("User already exists with this email", 400);
        }

        let imagePath = null;

        if (image) {
          if (Buffer.isBuffer(image)) {
            throw new Error(
              "Image should be a string (URL or file path), not binary data."
            );
          }
          imagePath = await upload(
            image,
            `${company.name.replace(/\s+/g, "")}/users`
          );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
          email,
          password: hashedPassword,
          firstname,
          lastname,
          company: company._id,
          image: imagePath,
          role: "User",
          permissions,
        });

        const permissionsAry = newUser.permissions.map((permission) =>
          permission.toString()
        );

        return {
          id: newUser._id,
          email: newUser.email,
          firstname: newUser.firstname,
          lastname: newUser.lastname,
          company: newUser.company,
          image: newUser.image,
          permissions: permissionsAry,
        };
      } catch (error) {
        throw new CustomError(
          error.message || "An error occurred while creating the user",
          500
        );
      }
    },
  },
};

module.exports = userResolver;
