"use strict";
const CustomError = require("../Utilities/CustomError");
const { requireIdentity, requireCustomer, requireStaff, requireAdmin, requirePlatformAdmin, requireCompany, objectId, pagination } = require("./access");

const { createAttemptLimiter, validatePassword } = require("./http");
const limitAuth = createAttemptLimiter();
const AUTH_OPERATIONS = new Set(["login", "loginCustomer", "createCustomer", "forgetPassword", "resetPassword", "notifyMe"]);

const PUBLIC = new Set([
  "Query.categories", "Query.category", "Query.subcategories", "Query.subcategory",
  "Query.physicalProducts", "Query.physicalProduct", "Query.digitalProducts", "Query.digitalProduct", "Query.getReviews",
  "Mutation.login", "Mutation.loginCustomer", "Mutation.createCustomer", "Mutation.forgetPassword", "Mutation.resetPassword", "Mutation.notifyMe", "Mutation.logout",
]);
const CUSTOMER = new Set([
  "Query.getCart", "Query.GetMyOrder", "Query.getFavourites",
  "Mutation.createCart", "Mutation.updateCart", "Mutation.deleteCart", "Mutation.AddOrder", "Mutation.cancelCheckout",
  "Mutation.addToFavourite", "Mutation.removeFromFavourite", "Mutation.writeReview", "Mutation.updateReview",
]);
const STAFF = new Set([
  "Query.me", "Query.permissions", "Query.categorieslist", "Query.subcategorieslist", "Query.getAllImages",
  "Query.menus", "Query.menu", "Query.getPage", "Query.listPages", "Mutation.updateMe",
  "Mutation.createCategory", "Mutation.updateCategory", "Mutation.deleteCategory",
  "Mutation.createSubcategory", "Mutation.updateSubcategory", "Mutation.deleteSubcategory",
  "Mutation.createPhysicalProduct", "Mutation.updatePhysicalProduct", "Mutation.deletePhysicalProduct",
  "Mutation.createDigitalProduct", "Mutation.updateDigitalProduct", "Mutation.deleteDigitalProduct",
  "Mutation.uploadImages", "Mutation.deleteImage", "Mutation.createMenu", "Mutation.updateMenu", "Mutation.deleteMenu",
  "Mutation.createPage", "Mutation.updatePage", "Mutation.deletePage",
]);
const ADMIN = new Set([
  "Query.userlist", "Query.users", "Query.userById", "Query.vendorById", "Query.vendors",
  "Mutation.createUser", "Mutation.updateUser", "Mutation.deleteUser", "Mutation.createVendor", "Mutation.updateVendor", "Mutation.deleteVendor",
]);
// These legacy records have no tenant field. They are not safe for arbitrary company admins.
const PLATFORM = new Set([
  "Query.getCarts", "Query.getAllOrders", "Query.getOrderById", "Query.getAllTransactions", "Query.getTransactionById",
  "Query.getAllNotification", "Query.getAllEmails", "Query.getAllCardDashboard", "Query.getAllCoupons", "Query.getCouponByID",
  "Mutation.createCoupon", "Mutation.updateCoupon", "Mutation.deleteCoupons", "Mutation.sendInvoiceEmail", "Mutation.updateOrderStatus",
]);
const DISABLED = new Set(["Mutation.register", "Mutation.createOrder", "Mutation.updateTransactionStatus", "Mutation.deleteOldPendingOrders"]);

const RESOURCES = {
  "Query.userById": ["userModel", "userId"], "Mutation.updateUser": ["userModel", "userId"], "Mutation.deleteUser": ["userModel", "userId"],
  "Query.vendorById": ["vendorModel", "vendorId"], "Mutation.updateVendor": ["vendorModel", "id"], "Mutation.deleteVendor": ["vendorModel", "id"],
  "Query.menu": ["menuModel", "id"], "Mutation.updateMenu": ["menuModel", "id"], "Mutation.deleteMenu": ["menuModel", "id"],
  "Query.getPage": ["pageModel", "id"], "Mutation.updatePage": ["pageModel", "id"], "Mutation.deletePage": ["pageModel", "id"],
  "Mutation.updateCategory": ["categoryModel", "id"], "Mutation.deleteCategory": ["categoryModel", "id"],
  "Mutation.updateSubcategory": ["subCategoryModel", "id"], "Mutation.deleteSubcategory": ["subCategoryModel", "id"],
  "Mutation.updatePhysicalProduct": ["physicalProductModel", "id"], "Mutation.deletePhysicalProduct": ["physicalProductModel", "id"],
  "Mutation.updateDigitalProduct": ["digitalProductModel", "id"], "Mutation.deleteDigitalProduct": ["digitalProductModel", "id"],
};

async function authorize(key, args = {}, context) {
  if (DISABLED.has(key)) throw new CustomError("This operation is disabled; use the approved operational workflow", 403);
  if (PUBLIC.has(key)) return;
  if (CUSTOMER.has(key)) {
    requireCustomer(context, args.customerId || args.userId || args.input?.userId || context?.userId);
    return;
  }
  if (PLATFORM.has(key)) requirePlatformAdmin(context);
  else if (ADMIN.has(key)) requireAdmin(context);
  else if (STAFF.has(key)) requireStaff(context);
  else throw new CustomError("Operation is not authorized", 403);

  const resource = RESOURCES[key];
  if (resource) {
    const Model = require(`../Model/${resource[0]}`);
    const record = requireCompany(await Model.findById(objectId(args[resource[1]])), context);
    if (args.deleteImages?.some(image => !record.images?.includes(image))) {
      throw new CustomError("Only images belonging to this product can be deleted", 400);
    }
    if (key === "Mutation.deleteUser" && (record.role === "Admin" || String(record._id) === String(context.userId))) {
      throw new CustomError("Administrator/self deletion requires a separate reviewed workflow", 403);
    }
  }
  if (key === "Mutation.deleteImage") {
    if (!Array.isArray(args.imageIds) || !args.imageIds.length || args.imageIds.length > 100) throw new CustomError("Invalid image selection", 400);
    const Media = require("../Model/mediaModel");
    // Check every item before permitting any deletion.
    for (const id of args.imageIds) requireCompany(await Media.findById(objectId(id)), context);
  }
  for (const [id, model] of [[args.input?.category || args.categoryId, "categoryModel"], [args.input?.subcategory, "subCategoryModel"]]) {
    if (id) requireCompany(await require(`../Model/${model}`).findById(objectId(id)), context);
  }
  if (key === "Mutation.updateMe" && args.input?.company && String(args.input.company) !== String(context.user.company)) {
    throw new CustomError("Company membership cannot be changed through profile updates", 403);
  }
}

function secureResolvers(resolvers) {
  const secured = { ...resolvers };
  for (const type of ["Query", "Mutation"]) {
    secured[type] = Object.fromEntries(Object.entries(resolvers[type] || {}).map(([name, resolve]) => [name, async (parent, args, context, info) => {
      if (type === "Mutation" && AUTH_OPERATIONS.has(name)) limitAuth(`${context?.ip || "internal"}:${name}`);
      await authorize(`${type}.${name}`, args, context);
      if (type === "Mutation" && ["createCustomer", "resetPassword", "createUser", "updateUser", "createVendor", "updateVendor"].includes(name)) {
        const password = args.newPassword ?? args.password ?? args.input?.password;
        if (password != null) validatePassword(password);
      }
      const page = args.pagination?.page ?? args.page ?? 1;
      const limit = args.pagination?.limit ?? args.limit ?? 10;
      pagination(page, limit);
      return resolve(parent, args, context, info);
    }]));
  }
  return secured;
}

module.exports = { secureResolvers, authorize, PUBLIC, CUSTOMER, STAFF, ADMIN, PLATFORM, DISABLED };
