const Coupon = require("../../Model/couponModel");
const { checkPermission } = require("../../Utilities/permissionMiddleware");

const couponResolver = {
  Query: {
    getAllCoupons: async (_, { pagination }) => {
      const { page = 1, limit = 10 } = pagination || {};
      try {
        const coupons = await Coupon.find()
          .skip((page - 1) * limit)
          .limit(limit);
        return {
          coupons,
          totalPages: Math.ceil((await Coupon.countDocuments()) / limit),
          currentPage: page,
          total: await Coupon.countDocuments(),
        };
      } catch (error) {
        console.log(error);
        throw new CustomError(error.message, 500);
      }
    },
    getCouponByID: async (_, { id }) => {
      try {
        return await Coupon.findById(id);
      } catch (error) {
        throw new CustomError("Coupon not found", 404);
      }
    },
  },

  Mutation: {
    createCoupon: checkPermission({
      module: "Coupons",
      name: "Add Coupons",
    })(async (_, { input }) => {
      const newCoupon = new Coupon(input);
      await newCoupon.save();
      return newCoupon;
    }),

    deleteCoupons: checkPermission({
      module: "Coupons",
      name: "Delete Coupons",
    })(async (_, { ids }) => {
      const result = await Coupon.deleteMany({ _id: { $in: ids } });
      return result.deletedCount > 0;
    }),

    updateCoupon: checkPermission({
      module: "Coupons",
      name: "Edit Coupons",
    })(async (_, { id, input }) => {
      const updatedCoupon = await Coupon.findByIdAndUpdate(id, input, {
        new: true,
      });
      if (!updatedCoupon) {
        throw new Error("Coupon not found");
      }
      return updatedCoupon;
    }),
  },
};

module.exports = couponResolver;
