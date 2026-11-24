const { cookieOptions } = require("../../Security/http");
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
const { checkPermission } = require("../../Utilities/permissionMiddleware");

const userResolver = {
  Query: {
    me: async (root, args, context) => {
      const user = await User.findById(context.userId)
        .populate("permissions")
        .populate("company");

      if (!user) throw new CustomError("Not authenticated", 401);
      const sanitizedUser = {
        ...user.toObject(),
        id: user._id.toString(),
        permissions: user.permissions.map((perm) => ({
          id: perm._id?.toString() || null,
          module: perm.module || null,
          name: perm.name || null,
          description: perm.description || null,
        })),
        company: user.company?._id?.toString() || null,
      };

      return sanitizedUser;
    },
    /* ------------------------------- For all user list ------------------------------- */
    userlist: async (root, args, context) => {
      if (!context.userId) {
        throw new CustomError("Not authenticated", 401);
      }
      try {
        const user = await User.find({ role: "User", company: context.user.company });
        if (!user) {
          throw new CustomError("User not found", 404);
        }
        return user;
      } catch (error) {
        console.error("Error fetching user:", error);
        throw new CustomError(error.message, error.statusCode || 500);
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

        const users = await User.find({ role: "User", company: context.user.company }).skip(skip).limit(limit);

        const totalCount = await User.countDocuments({ role: "User", company: context.user.company });

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
    register: async () => {
      throw new CustomError("Public administrator registration is disabled", 403);
    },
    /* -------------------------------- For login ------------------------------- */
    login: async (root, { email, password, rememberMe }, context) => {
      try {
        const user = await User.findOne({ email })
          .populate("permissions")
          .populate("company")
          .exec();

        if (!user) {
          throw new CustomError("Invalid credentials", 401);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          throw new CustomError("Invalid credentials", 401);
        }

        const tokenExpiration = rememberMe ? "2d" : "2h";

        const token = jwt.sign({ userId: user._id, authVersion: user.authVersion || 0 }, JWT_SECRET, {
          expiresIn: tokenExpiration,
        });

        context.res.cookie("token", token, cookieOptions(rememberMe ? 2 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000));

        return { user, token };
      } catch (error) {
        console.error("Error logging in:", error);
        throw new CustomError(error.message, error.statusCode || 500);
      }
    },
    /* ------------------------------- For logout ------------------------------- */
    logout: async (root, args, context) => {
      try {
        for (const name of ["token", "UserDetails", "CustomerDetails"]) context.res.clearCookie(name, cookieOptions());
        return true;
      } catch (error) {
        console.error("Error logging out:", error);
        throw new CustomError("Error during logout", 500);
      }
    },
    /* ------------------------------- For create user ------------------------------- */
    createUser: checkPermission({
      module: "Users",
      name: "Add Users",
    })(async (_, { input, image }, context) => {
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
    }),

    /* ------------------------------- For update user ------------------------------- */
    updateUser: checkPermission({
      module: "Users",
      name: "Edit Users",
    })(async (_, { userId, input, image }, context) => {
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
          user.authVersion = (user.authVersion || 0) + 1;
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
    }),
    /* ------------------------------- For delete user ------------------------------- */
    deleteUser: checkPermission({
      module: "Users",
      name: "Delete Users",
    })(async (_, { userId }, context) => {
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
    }),
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
      if (company && String(company) !== String(user.company)) throw new CustomError("Company membership cannot be changed", 403);
      await user.save();

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
