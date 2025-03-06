const { gql } = require("apollo-server-express");

const favouriteTypeDef = gql`
  enum FavouriteItemType {
    PhysicalProduct
    DigitalProduct
  }

  type Product {
    _id: ID!
    title: String
    price: Float
    images: [String]
    colors: [String]
    sizes: [String]
    status: String
  }

  type Favourite {
    _id: ID!
    userId: ID!
    productId: Product!
    productType: FavouriteItemType!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    getFavourites(userId: ID!): [Favourite]
  }

  type Mutation {
    addToFavourite(
      userId: ID!
      productId: ID!
      productType: FavouriteItemType!
    ): Favourite
    removeFromFavourite(
      userId: ID!
      productId: ID!
      productType: FavouriteItemType!
    ): String
  }
`;

module.exports = favouriteTypeDef;
