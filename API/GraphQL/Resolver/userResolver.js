const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const User = require("../../Model/userModel");
const CustomError = require("../../Utilities/CustomError");
const { upload } = require("../../Utilities/upload");
const Company = require("../../Model/companyModel");
const Permission = require("../../Model/permissionModel");
const {
  deleteImageFromStorage,
} = require("../../Utilities/miscellaneousUtils");

const userResolver = {
  Query: {
    me: async (root, args, context) => {
      const user = await User.findById(context.userId)
        .populate("permissions")
        .populate("company");

      const sanitizedUser = {
        ...user.toObject(),
        id: user._id.toString(),
        permissions: user.permissions.map((perm) => ({
          id: perm._id?.toString() || null,
          module: perm.module || null,
          name: perm.name || null,
          description: perm.description || null,
        })),
        company: user.company
          ? {
              id: user.company._id.toString(),
              name: user.company.name,
            }
          : null,
      };

      return sanitizedUser;
    },
    /* ------------------------------- For all user list ------------------------------- */
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
    /* ------------------------------- For user pagination ------------------------------- */
    users: async (_, { page = 1, limit = 10 }, context) => {
      try {
        const company = await Company.findById(context.user.company);
        if (!company) {
          throw new CustomError("Company not found", 404);
        }

        const skip = (page - 1) * limit;

        const users = await User.find({ role: "User" }).skip(skip).limit(limit);

        const totalCount = await User.countDocuments({
          role: "User",
        });

        const userList = users.map((user) => ({
          id: user._id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          company: user.company,
          image: user.image,
          role: user.role,
          permissions: user.permissions.map((permission) =>
            permission.toString()
          ),
        }));

        return {
          users: userList,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
        };
      } catch (error) {
        throw new CustomError(
          error.message || "An error occurred while fetching the user list",
          500
        );
      }
    },
    /* ------------------------------- For user by ID ------------------------------- */
    userById: async (_, { userId }, context) => {
      try {
        const company = await Company.findById(context.user.company);
        if (!company) {
          throw new CustomError("Company not found", 404);
        }

        const user = await User.findById(userId);
        if (!user) {
          throw new CustomError("User not found", 404);
        }

        if (!user.company.equals(context.user.company)) {
          throw new CustomError(
            "Unauthorized: User does not belong to your company",
            403
          );
        }

        return {
          id: user._id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          company: user.company,
          password: user.password,
          image: user.image,
          role: user.role,
          permissions: user.permissions.map((permission) =>
            permission.toString()
          ),
        };
      } catch (error) {
        throw new CustomError(
          error.message || "An error occurred while fetching the user",
          500
        );
      }
    },
  },

  Mutation: {
    /* ------------------------------ For register ------------------------------ */
    register: async (root, { input, image }, context) => {
      const { email, password, firstname, lastname, company } = input;

      try {
        let user = await User.findOne({ email }).populate("permissions").exec();
        let imagePath = null;

        if (image) {
          imagePath = await upload(
            image,
            `${company.replace(/\s+/g, "")}/users`
          );
        }

        if (user) {
          throw new CustomError("User already exists", 400);
        }

        const permissionsToCheck = [
          {
            module: "Dashboard",
            name: "View Dashboard",
            description: "Allows the user to view the dashboard overview.",
          },
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
            module: "Sales",
            name: "View Sales",
            description: "Allows the user to view sales data and reports.",
          },
          {
            module: "Sales",
            name: "Manage Sales",
            description:
              "Allows the user to manage sales transactions and orders.",
          },
          {
            module: "Coupons",
            name: "View Coupons",
            description:
              "Allows the user to view available coupons on the platform.",
          },
          {
            module: "Coupons",
            name: "Create Coupons",
            description: "Allows the user to create new coupons for customers.",
          },
          {
            module: "Pages",
            name: "View Pages",
            description: "Allows the user to view pages on the platform.",
          },
          {
            module: "Pages",
            name: "Create Pages",
            description: "Allows the user to create new pages on the platform.",
          },
          {
            module: "Media",
            name: "Manage Media",
            description:
              "Allows the user to manage media files (images, videos, etc.).",
          },
          {
            module: "Menus",
            name: "View Menus",
            description: "Allows the user to view menus on the platform.",
          },
          {
            module: "Menus",
            name: "Create Menus",
            description: "Allows the user to create new menus.",
          },
          {
            module: "Users",
            name: "View Users",
            description:
              "Allows the user to view the list of users on the platform.",
          },
          {
            module: "Users",
            name: "Create Users",
            description: "Allows the user to create new users on the platform.",
          },
          {
            module: "Vendors",
            name: "View Vendors",
            description:
              "Allows the user to view the list of vendors on the platform.",
          },
          {
            module: "Vendors",
            name: "Create Vendors",
            description: "Allows the user to add new vendors to the platform.",
          },
          {
            module: "Localization",
            name: "View Translations",
            description:
              "Allows the user to view translation settings for the platform.",
          },
          {
            module: "Localization",
            name: "Manage Currency Rates",
            description:
              "Allows the user to manage currency rates on the platform.",
          },
          {
            module: "Localization",
            name: "Manage Taxes",
            description:
              "Allows the user to manage tax settings for the platform.",
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
            module: "Settings",
            name: "Manage Settings",
            description: "Allows the user to manage platform settings.",
          },
          {
            module: "Settings",
            name: "View Profile",
            description:
              "Allows the user to view and update their profile settings.",
          },
          {
            module: "Invoice",
            name: "View Invoices",
            description:
              "Allows the user to view invoices generated on the platform.",
          },
          {
            module: "Invoice",
            name: "Manage Invoices",
            description: "Allows the user to manage and process invoices.",
          },
          {
            module: "Log Out",
            name: "Log Out",
            description: "Allows the user to log out of the platform.",
          },
        ];

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

        await user.save();

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
          expiresIn: "2h",
        });

        context.res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 2 * 60 * 60 * 1000,
          path: "/",
        });

        const populatedUser = await User.findById(user._id)
          .populate("permissions", "id module name description")
          .exec();

        return {
          user: populatedUser,
          token,
        };
      } catch (error) {
        console.error("Error during registration:", error);
        throw new CustomError(error.message, 500);
      }
    },
    /* -------------------------------- For login ------------------------------- */
    login: async (root, { email, password, rememberMe }, context) => {
      try {
        const user = await User.findOne({ email })
          .populate("permissions")
          .populate("company")
          .exec();

        if (!user) {
          throw new CustomError("User not found with this email", 404);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          throw new CustomError("Invalid credentials", 401);
        }

        const tokenExpiration = rememberMe ? "2d" : "2h";

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
          expiresIn: tokenExpiration,
        });

        context.res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: rememberMe ? 2 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000,
          path: "/",
        });

        context.res.cookie("UserDetails", token, {
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
    /* ------------------------------- For create user ------------------------------- */
    createUser: async (_, { input, image }, context) => {
      const { email, password, firstname, lastname, permissions } = input;
      try {
        // Find the company of the user creating this new user
        let company = await Company.findById(context.user.company);
        if (!company) {
          throw new CustomError("Company not found", 404);
        }

        // Check if the email already exists
        let existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new CustomError("User already exists with this email", 400);
        }

        let imagePath = null;

        // Validate and upload image if provided
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

        const AllPermission = await Permission.find();

        if (AllPermission.length === permissions.length) {
          throw new CustomError("User can not add all permissions", 403);
        }

        // Create the new user with the filtered permissions
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

    /* ------------------------------- For update user ------------------------------- */
    updateUser: async (_, { userId, input, image }, context) => {
      const { email, password, firstname, lastname, permissions } = input;

      try {
        let company = await Company.findById(context.user.company);
        if (!company) {
          throw new CustomError("Company not found", 404);
        }

        let user = await User.findById(userId);
        if (!user) {
          throw new CustomError("User not found", 404);
        }

        if (email && email !== user.email) {
          let existingUser = await User.findOne({ email });
          if (existingUser) {
            throw new CustomError(
              "Another user already exists with this email",
              400
            );
          }
          user.email = email;
        }

        if (firstname) user.firstname = firstname;
        if (lastname) user.lastname = lastname;

        if (permissions) {
          user.permissions = permissions.map((permission) =>
            permission.toString()
          );
        }

        if (password) {
          user.password = await bcrypt.hash(password, 10);
        }

        if (image) {
          if (Buffer.isBuffer(image)) {
            throw new Error(
              "Image should be a string (URL or file path), not binary data."
            );
          }
          const imagePath = await upload(
            image,
            `${company.name.replace(/\s+/g, "")}/users`
          );
          user.image = imagePath;
        }

        await user.save();

        return {
          id: user._id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          company: company._id,
          image: user.image,
          permissions: user.permissions.map((permission) =>
            permission.toString()
          ),
        };
      } catch (error) {
        throw new CustomError(
          error.message || "An error occurred while updating the user",
          500
        );
      }
    },
    /* ------------------------------- For delete user ------------------------------- */
    deleteUser: async (_, { userId }, context) => {
      try {
        const company = await Company.findById(context.user.company);
        if (!company) {
          throw new CustomError("Company not found", 404);
        }
        const user = await User.findById(userId);

        if (!user) {
          throw new CustomError("User not found", 404);
        }

        if (user.image) {
          await deleteImageFromStorage(user.image);
        }

        if (!user.company.equals(context.user.company)) {
          throw new CustomError(
            "Unauthorized: User does not belong to your company",
            403
          );
        }

        await User.findByIdAndDelete(userId);

        return {
          success: true,
          message: `User with ID ${userId} has been deleted successfully.`,
        };
      } catch (error) {
        throw new CustomError(
          error.message || "An error occurred while deleting the user",
          500
        );
      }
    },
    updateMe: async (root, { input }, { userId }) => {
      if (!userId) {
        throw new Error("Not authenticated");
      }

      const user = await User.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      const { email, firstname, lastname, company } = input;
      if (email) user.email = email;
      if (firstname) user.firstname = firstname;
      if (lastname) user.lastname = lastname;
      if (company) user.company = company;

      const updatedUser = await User.findById(userId).populate("permissions");

      return {
        ...updatedUser.toObject(),
        id: updatedUser._id.toString(),
        permissions: updatedUser.permissions.map((permission) => ({
          ...permission.toObject(),
          id: permission._id.toString(),
        })),
      };
    },
  },
};

module.exports = userResolver;
