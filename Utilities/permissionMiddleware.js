const Permission = require("../Model/permissionModel");
const CustomError = require("./CustomError");

const findPermissionId = async (module, name) => {
  try {
    const permission = await Permission.findOne({ module, name });
    if (!permission) {
      throw new Error(
        `Permission not found for module: ${module}, name: ${name}`
      );
    }
    return permission._id; // Return the _id of the permission
  } catch (error) {
    console.error("Error finding permission:", error);
    throw error;
  }
};

const checkPermission = (requiredPermission) => {
  return (resolve) => {
    return async (parent, args, context, info) => {

      if (!context || !context.user) {
        throw new CustomError("Unauthorized: User not authenticated.", 401);
      }

      const { user } = context;

      // Find the permission ID for the required permission
      const permissionId = await findPermissionId(
        requiredPermission.module,
        requiredPermission.name
      );

      // Fetch permissions for the user from the database
      const userPermissions = user.permissions;

      if (!userPermissions || userPermissions.length === 0) {
        throw new CustomError("Unauthorized: User permissions not found.", 403);
      }

      // Check if the user has the required permission
      const hasPermission = userPermissions.some(
        (permission) => permission._id.toString() === permissionId.toString()
      );

      if (!hasPermission) {
        throw new CustomError(
          `Unauthorized: You do not have permission to ${requiredPermission.name}.`,
          403
        );
      }

      // Forward the resolver with context
      return resolve(parent, args, context, info);
    };
  };
};

module.exports = { checkPermission };
