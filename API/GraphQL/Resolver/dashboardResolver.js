const Coupon = require("../../Model/couponModel");
const Vendor = require("../../Model/vendorModel");
const Order = require("../../Model/orderModel");
const Message = require("../../Model/notificationModel");
const CustomError = require("../../Utilities/CustomError");
const PhysicalProduct = require("../../Model/physicalProductModel")
const DigitalProduct = require("../../Model/digitalProductModel");

const dashboardResolver = {
  Query: {
    getAllCardDashboard: async (root, args, context) => {
      try {
        const Orders = await Order.find();
        let totalEarning = Orders.filter(
          (order) => order.paymentStatus === "PAID"
        ).reduce((sum, order) => sum + order.finalTotal, 0);
        const sumofvendor = (await Vendor.find()).length;
        const countMessage = (await Message.find()).length;
        const physicalProducts = (await PhysicalProduct.find()).length
        const digitalProducts = (await DigitalProduct.find()).length;
        const obj = {
          earning: totalEarning,
          vendors: sumofvendor,
          message: countMessage,
          products: physicalProducts + digitalProducts,
        };
        return obj;
      } catch (error) {
        console.error("Error fetching category:", error);
        throw new CustomError(error.message, 500);
      }
    },
  },
};

module.exports = dashboardResolver;
