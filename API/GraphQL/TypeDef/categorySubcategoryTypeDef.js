const { gql } = require("apollo-server-express");

const categorySubcategoryTypeDef = gql`
  scalar Upload

  enum ItemType {
    Physical
    Digital
  }

  type Category {
    id: ID!
    name: String!
    type: ItemType!
    image: String
    description: String!
    subcategories: [Subcategory]
  }

  type Subcategory {
    id: ID!
    name: String!
    image: String
    type: ItemType!
    description: String!
    category: Category!
  }

  input PaginationInput {
    page: Int!
    limit: Int!
  }

  type PaginatedCategories {
    categories: [Category]
    currentPage: Int!
    totalPages: Int!
    total: Int!
  }

  type PaginatedSubcategories {
    subcategories: [Subcategory]
    currentPage: Int!
    totalPages: Int!
    total: Int!
  }

  type Query {
    categories(pagination: PaginationInput): PaginatedCategories
    category(id: ID!): Category
    categorieslist: [Category!]!
    subcategories(pagination: PaginationInput): PaginatedSubcategories
    subcategorieslist: [Subcategory!]!
    subcategory(id: ID!): Subcategory
  }

  type Mutation {
    createCategory(
      name: String!
      type: ItemType!
      description: String
      image: Upload
    ): Category
    updateCategory(
      id: ID!
      name: String
      type: ItemType
      description: String
      image: Upload
    ): Category
    deleteCategory(id: ID!): Boolean

    createSubcategory(
      name: String!
      description: String
      image: Upload
      type: ItemType
      categoryId: ID!
    ): Subcategory
    updateSubcategory(
      id: ID!
      name: String
      type: ItemType
      description: String
      image: Upload
    ): Subcategory
    deleteSubcategory(id: ID!): Boolean
  }
`;

module.exports = categorySubcategoryTypeDef;
