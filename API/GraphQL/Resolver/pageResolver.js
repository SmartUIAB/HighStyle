const Company = require("../../Model/companyModel");
const Page = require("../../Model/pageModel");
const CustomError = require("../../Utilities/CustomError");
const { checkPermission } = require("../../Utilities/permissionMiddleware");

const pageResolvers = {
  Query: {
    getPage: async (_, { id }) => {
      try {
        const page = await Page.findById(id);
        if (!page) {
          throw new CustomError(`Page with ID ${id} not found`);
        }
        return page;
      } catch (error) {
        throw new CustomError("Error fetching page: " + error.message);
      }
    },
    listPages: async (_, args, context) => {
      try {
        return await Page.find({ company: context.user.company });
      } catch (error) {
        throw new CustomError("Error fetching pages: " + error.message);
      }
    },
  },
  Mutation: {
    createPage: checkPermission({
      module: "Pages",
      name: "Add Pages",
    })(async (_, { input }, context) => {
      try {
        const company = await Company.findById(context.user.company);
        if (!company) {
          throw new CustomError("Company not found");
        }

        const newPage = new Page({
          ...input,
          company: company._id,
        });

        await newPage.save();
        return newPage;
      } catch (error) {
        throw new CustomError("Error creating page: " + error.message);
      }
    }),

    updatePage: checkPermission({
      module: "Pages",
      name: "Edit Pages",
    })(async (_, { id, input }) => {
      try {
        const updatedPage = await Page.findByIdAndUpdate(id, input, {
          new: true,
        });
        if (!updatedPage) {
          throw new CustomError(`Page with ID ${id} not found`);
        }
        return updatedPage;
      } catch (error) {
        throw new CustomError("Error updating page: " + error.message);
      }
    }),

    deletePage: checkPermission({
      module: "Pages",
      name: "Delete Pages",
    })(async (_, { id }) => {
      try {
        const deletedPage = await Page.findByIdAndDelete(id);
        if (!deletedPage) {
          throw new CustomError(`Page with ID ${id} not found`);
        }
        return deletedPage;
      } catch (error) {
        throw new CustomError("Error deleting page: " + error.message);
      }
    }),
  },
};

module.exports = pageResolvers;
