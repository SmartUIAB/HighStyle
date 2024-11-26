const Coupon = require("../../Model/couponModel");

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
  },

  Mutation: {
    // Create a new coupon
    createCoupon: async (_, { input }) => {
      const newCoupon = new Coupon(input);
      await newCoupon.save();
      return newCoupon;
    },

    // Delete multiple coupons at once
    deleteCoupons: async (_, { ids }) => {
      const result = await Coupon.deleteMany({ _id: { $in: ids } });
      return result.deletedCount > 0;
    },

    //update coupon at once
    updateCoupon: async (_, { id, input }) => {
      const updatedCoupon = await Coupon.findByIdAndUpdate(id, input, {
        new: true,
      });
      if (!updatedCoupon) {
        throw new Error("Coupon not found");
      }
      return updatedCoupon;
    },
  },
};

module.exports = couponResolver;
