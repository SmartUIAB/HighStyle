const Order = require("../../Model/orderModel");
const Transaction = require("../../Model/transactionModel");
const PhysicalProduct = require("../../Model/physicalProductModel");
const DigitalProduct = require("../../Model/digitalProductModel");
const {
  calculateOrderTotalWithCoupon,
} = require("../../Utilities/miscellaneousUtils");
const Coupon = require("../../Model/couponModel");
const { checkPermission } = require("../../Utilities/permissionMiddleware");

const salesResolver = {
  Query: {
    getOrderById: async (_, { id }) => {
      const order = await Order.findById(id)
        .populate("user")
        .populate("transaction");

      if (!order) throw new Error("Order not found");

      const {
        user,
        transaction,
        products,
        finalTotal,
        paymentStatus,
        orderStatus,
        shippingAddress,
        createdAt,
        updatedAt,
      } = order;

      return {
        id: order._id.toString(),
        user: {
          ...user.toObject(),
          id: user._id.toString(),
          permissions:
            user.permissions?.map((permission) => permission.toString()) || [],
        },
        transaction: transaction
          ? { ...transaction.toObject(), id: transaction._id.toString() }
          : null,
        products,
        finalTotal,
        paymentStatus,
        orderStatus,
        shippingAddress,
        createdAt,
        updatedAt,
      };
    },

    getAllOrders: async (_, { page = 1, limit = 10 }) => {
      try {
        const totalCount = await Order.countDocuments();
        const totalPages = Math.ceil(totalCount / limit);

        const orders = await Order.find()
          .populate("customer")
          .populate("transaction")
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();

        const updatedOrder = orders.map((order) => {
          return {
            id: order._id.toString(),
            ...order,
            user: {
              ...order.customer,
              id: order.customer._id.toString(),
            },
          };
        });

        return {
          totalCount,
          totalPages,
          currentPage: page,
          orders: updatedOrder,
        };
      } catch (error) {
        throw new Error(`Error fetching orders: ${error.message}`);
      }
    },

    getTransactionById: async (_, { id }) => {
      const transaction = await Transaction.findById(id).populate("order");
      if (!transaction) throw new Error("Transaction not found");

      const order = transaction.order
        ? {
            ...transaction.order.toObject(),
            id: transaction.order._id.toString(),
            user: {
              ...transaction.order.user,
              id: transaction.order.user._id.toString(),
              permissions: transaction.order.user.permissions.map(
                (permission) => permission.toString()
              ),
            },
          }
        : null;

      return {
        ...transaction.toObject(),
        id: transaction._id.toString(),
        order,
      };
    },

    getAllTransactions: async (_, { page = 1, limit = 10 }) => {
      try {
        const totalCount = await Transaction.countDocuments();
        const totalPages = Math.ceil(totalCount / limit);

        const transactions = await Transaction.find()
          .populate({
            path: "order",
            populate: {
              path: "customer",
              model: "Customer",
            },
          })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();

        const sanitizedTransactions = transactions.map((transaction) => {
          const sanitizedOrder = transaction.order
            ? {
                ...transaction.order,
                id: transaction.order._id.toString(),
                user: transaction.order.customer
                  ? {
                      ...transaction.order.customer,
                      id: transaction.order.customer._id.toString(),
                      // permissions:
                      //   transaction.order.customer.permissions?.map(
                      //     (permission) => permission.toString()
                      //   ) || [],
                    }
                  : null,
              }
            : null;

          return {
            id: transaction._id.toString(),
            order: sanitizedOrder,
            transactionAmount: transaction.transactionAmount,
            transactionStatus: transaction.transactionStatus,
            paymentGateway: transaction.paymentGateway,
            transactionId: transaction.transactionId,
            createdAt: transaction.createdAt,
          };
        });

        return {
          totalCount,
          totalPages,
          currentPage: page,
          transactions: sanitizedTransactions,
        };
      } catch (err) {
        console.error("Error fetching transactions:", err.message);
        throw new Error("Failed to fetch transactions");
      }
    },
  },

  Mutation: {
    createOrder: async (
      _,
      { userId, products, shippingAddress, couponCode }
    ) => {
      const physicalProductIds = products
        .filter((p) => p.productType === "PHYSICAL")
        .map((p) => p.productId);

      const digitalProductIds = products
        .filter((p) => p.productType === "DIGITAL")
        .map((p) => p.productId);

      const physicalProductDetails = await PhysicalProduct.find({
        _id: { $in: physicalProductIds },
      });
      const digitalProductDetails = await DigitalProduct.find({
        _id: { $in: digitalProductIds },
      });

      const productDetails = [
        ...physicalProductDetails,
        ...digitalProductDetails,
      ];
      const coupon = await Coupon.findOne({ code: couponCode }).lean();

      const {
        orderTotal,
        finalTotal,
        discountApplied = 0,
        couponApplied,
        appliedCouponCode,
      } = calculateOrderTotalWithCoupon(products, productDetails, coupon);

      const newOrder = new Order({
        user: userId,
        products,
        finalTotal: finalTotal.toFixed(2),
        shippingAddress,
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        couponApplied,
        appliedCouponCode,
      });

      await newOrder.save();
      return {
        user: userId,
        orderId: newOrder._id.toString(),
        products: newOrder.products,
        finalTotal: newOrder.finalTotal,
        discountApplied,
        shippingAddress: newOrder.shippingAddress,
        paymentStatus: newOrder.paymentStatus,
        orderStatus: newOrder.orderStatus,
      };
    },

    updateOrderStatus: async (_, { orderId, orderStatus, paymentStatus }) => {
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { orderStatus, paymentStatus },
        { new: true }
      )
        .populate("user")
        .populate("transaction");

      if (!updatedOrder) {
        throw new Error("Order not found");
      }

      return {
        ...updatedOrder.toObject(),
        id: updatedOrder._id.toString(),
        user: {
          ...updatedOrder.user,
          id: updatedOrder.user._id.toString(),
          permissions: updatedOrder.user.permissions.map((permission) =>
            permission.toString()
          ),
        },
        transaction: updatedOrder.transaction
          ? {
              ...updatedOrder.transaction.toObject(),
              id: updatedOrder.transaction._id.toString(),
            }
          : null,
      };
    },

    updateTransactionStatus: async (
      _,
      { transactionId, transactionStatus }
    ) => {
      const updatedTransaction = await Transaction.findByIdAndUpdate(
        transactionId,
        { transactionStatus },
        { new: true }
      )
        .populate("user")
        .populate("order");

      if (!updatedTransaction) {
        throw new Error("Transaction not found");
      }

      return {
        ...updatedTransaction.toObject(),
        id: updatedTransaction._id.toString(),
        user: {
          ...updatedTransaction.user,
          id: updatedTransaction.user._id.toString(),
          permissions: updatedTransaction.user.permissions.map((permission) =>
            permission.toString()
          ),
        },
        order: updatedTransaction.order
          ? {
              ...updatedTransaction.order.toObject(),
              id: updatedTransaction.order._id.toString(),
            }
          : null,
      };
    },
  },
};

module.exports = salesResolver;
