const CustomError = require("../../Utilities/CustomError");
const Permission = require("../../Model/permissionModel");

const permissionsResolver = {
  /* ---------------------------------- Query --------------------------------- */
  Query: {
    permissions: async (_) => {
      try {
        const permissions = await Permission.find().select(
          "id name description module"
        );
        return permissions;
      } catch (error) {
        throw new CustomError("Failed to fetch permissions", 500);
      }
    },
  },
};

module.exports = permissionsResolver;
