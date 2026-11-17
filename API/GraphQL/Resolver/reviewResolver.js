const Review = require("../../Model/reviewModel");

const reviewResolvers = {
  Query: {
    getReviews: async (_, { productId }) => {
      try {
        return await Review.find({ productId })
          .sort({ createdAt: -1 })
          .populate("userId", "firstname lastname");
      } catch (error) {
        throw new Error("Error fetching reviews: " + error.message);
      }
    },
  },
  Mutation: {
    writeReview: async (_, { productId, userId, rating, comment }) => {
      try {
        const existingReview = await Review.findOne({ productId, userId });

        if (existingReview) {
          throw new Error("You have already reviewed this product.");
        }

        const newReview = new Review({
          productId,
          userId,
          rating,
          comment,
        });

        await newReview.save();
        return {
          message: "Review added successfully",
        };
      } catch (error) {
        throw new Error("Error creating review: " + error.message);
      }
    },
    updateReview: async (_, { productId, userId, rating, comment }) => {
      try {
        const existingReview = await Review.findOne({ productId, userId });

        if (!existingReview) {
          throw new Error("Review not found for this product by the user.");
        }

        existingReview.rating = rating || existingReview.rating;
        existingReview.comment = comment || existingReview.comment;

        await existingReview.save();

        return {
          message: "Review updated successfully",
        };
      } catch (error) {
        throw new Error("Error updating review: " + error.message);
      }
    },
  },
};

module.exports = reviewResolvers;
