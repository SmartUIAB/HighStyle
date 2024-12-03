const bcrypt = require("bcryptjs");
const CustomError = require("../../Utilities/CustomError");
const { upload } = require("../../Utilities/upload");
const Company = require("../../Model/companyModel");
const Permission = require("../../Model/permissionModel");
const Vendor = require("../../Model/vendorModel");
const {
  deleteImageFromStorage,
} = require("../../Utilities/miscellaneousUtils");

const vendorResolver = {
  Query: {
    vendorById: async (_, { vendorId }) => {
      try {
        const vendor = await Vendor.findById(vendorId);

        if (!vendor) {
          console.log("Vendor not found");
          throw new CustomError("Vendor not found", 404);
        }

        return {
          id: vendor._id,
          name: vendor.name,
          email: vendor.email,
          businessType: vendor.businessType,
          contactNumber: vendor.contactNumber,
          address: vendor.address,
          company: vendor.company,
          logo: vendor.logo,
          status: vendor.status,
          permissions: vendor.permissions,
        };
      } catch (error) {
        console.error("Error fetching vendor:", error);
        throw new CustomError(
          error.message || "An error occurred while fetching the vendor",
          500
        );
      }
    },

    vendors: async (_, { page = 1, limit = 10 }) => {
      try {
        const skip = (page - 1) * limit;
        const totalCount = await Vendor.countDocuments();

        if (totalCount === 0) {
          return {
            vendors: [],
            totalCount,
            totalPages: 0,
            currentPage: page,
            perPage: limit,
          };
        }

        const vendors = await Vendor.find().skip(skip).limit(limit);

        return {
          vendors: vendors.map((vendor) => ({
            id: vendor._id.toString(),
            name: vendor.name,
            email: vendor.email,
            businessType: vendor.businessType,
            contactNumber: vendor.contactNumber,
            address: vendor.address,
            company: vendor.company,
            logo: vendor.logo,
            status: vendor.status,
            permissions: vendor.permissions,
          })),
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          perPage: limit,
        };
      } catch (error) {
        console.error("Error fetching vendors:", error);
        throw new CustomError(
          error.message || "An error occurred while fetching vendors",
          500
        );
      }
    },
  },

  Mutation: {
    createVendor: async (
      _,
      { input, logo, password, permissions },
      context
    ) => {
      const { name, email, businessType, contactNumber, address } = input;

      try {
        let company = await Company.findById(context.user.company);
        if (!company) {
          throw new CustomError("Company not found", 404);
        }

        let existingVendor = await Vendor.findOne({ email });
        if (existingVendor) {
          throw new CustomError("Vendor already exists with this email", 400);
        }

        let logoPath = null;

        if (logo) {
          if (Buffer.isBuffer(logo)) {
            throw new Error(
              "Logo should be a string (URL or file path), not binary data."
            );
          }
          logoPath = await upload(
            logo,
            `${company.name.replace(/\s+/g, "")}/vendors`
          );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const AllPermission = await Permission.find();

        if (AllPermission.length === permissions.length) {
          throw new CustomError("Vendor can not add all permissions", 403);
        }

        const newVendor = await Vendor.create({
          name,
          email,
          password: hashedPassword,
          businessType,
          contactNumber,
          address,
          company: company._id,
          logo: logoPath,
          status: "Active",
          permissions,
        });

        return {
          id: newVendor._id,
          name: newVendor.name,
          email: newVendor.email,
          businessType: newVendor.businessType,
          contactNumber: newVendor.contactNumber,
          address: newVendor.address,
          company: newVendor.company,
          logo: newVendor.logo,
          status: newVendor.status,
          permissions: newVendor.permissions,
        };
      } catch (error) {
        throw new CustomError(
          error.message || "An error occurred while creating the vendor",
          500
        );
      }
    },
    updateVendor: async (
      _,
      { id, input, logo, password, permissions },
      context
    ) => {
      try {
        let company = await Company.findById(context.user.company);
        if (!company) {
          throw new CustomError("Company not found", 404);
        }

        const vendor = await Vendor.findById(id);
        if (!vendor) {
          throw new CustomError("Vendor not found", 404);
        }

        let logoPath = vendor.logo;
        if (logo) {
          if (Buffer.isBuffer(logo)) {
            throw new Error(
              "Logo should be a string (URL or file path), not binary data."
            );
          }
          logoPath = await upload(
            logo,
            `${company.name.replace(/\s+/g, "")}/vendors`
          );
        }

        let hashedPassword = vendor.password;
        if (password) {
          hashedPassword = await bcrypt.hash(password, 10);
        }

        if (permissions && permissions.length === 0) {
          throw new CustomError("Permissions cannot be empty", 400);
        }

        const updatedVendor = await Vendor.findByIdAndUpdate(
          id,
          {
            $set: {
              ...input,
              password: hashedPassword,
              logo: logoPath,
              permissions: permissions || vendor.permissions,
            },
          },
          { new: true }
        );

        return {
          id: updatedVendor._id,
          name: updatedVendor.name,
          email: updatedVendor.email,
          businessType: updatedVendor.businessType,
          contactNumber: updatedVendor.contactNumber,
          address: updatedVendor.address,
          company: updatedVendor.company,
          logo: updatedVendor.logo,
          status: updatedVendor.status,
          permissions: updatedVendor.permissions,
        };
      } catch (error) {
        throw new CustomError(
          error.message || "An error occurred while updating the vendor",
          500
        );
      }
    },
    deleteVendor: async (_, { id }, context) => {
      try {
        const vendor = await Vendor.findById(id);
        if (!vendor) {
          throw new CustomError("Vendor not found", 404);
        }

        if (vendor.logo) {
          await deleteImageFromStorage(vendor.logo);
        }

        await Vendor.findByIdAndDelete(id);

        return {
          message: "Vendor successfully deleted.",
          success: true,
        };
      } catch (error) {
        throw new CustomError(
          error.message || "An error occurred while deleting the vendor",
          500
        );
      }
    },
  },
};

module.exports = vendorResolver;
