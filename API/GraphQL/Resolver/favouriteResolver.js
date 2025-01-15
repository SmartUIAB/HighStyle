const Favourite = require("../../Model/favouriteModel");

const favouriteResolver = {
  Query: {
    getFavourites: async (_, { userId }) => {
      try {
        return await Favourite.find({ userId }).populate({
          path: "productId",
          select: "_id title price colors sizes images status",
        });
      } catch (error) {
        throw new Error("Error fetching favourites: " + error.message);
      }
    },
  },
  
  Mutation: {
    addToFavourite: async (_, { userId, productId, productType }) => {
      try {
        const existingFavourite = await Favourite.findOne({
          userId,
          productId,
          productType,
        });

        if (existingFavourite) {
          throw new Error("Product already in favourites");
        }

        const favourite = new Favourite({
          userId,
          productId,
          productType,
        });

        await favourite.save();

        const populatedFavourite = await Favourite.findById(
          favourite._id
        ).populate({
          path: "productId",
          model: productType,
          select: "title price colors sizes images status",
        });

        return populatedFavourite;
      } catch (error) {
        throw new Error("Error adding to favourites: " + error.message);
      }
    },
    removeFromFavourite: async (_, { userId, productId, productType }) => {
      try {
        const result = await Favourite.findOneAndDelete({
          userId,
          productId,
          productType,
        });

        if (!result) {
          throw new Error("Favourite not found");
        }

        return "Favourite removed successfully";
      } catch (error) {
        throw new Error("Error removing from favourites: " + error.message);
      }
    },
  },
};

module.exports = favouriteResolver;
