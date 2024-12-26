const Company = require("../../Model/companyModel");
const Menu = require("../../Model/menuModel");
const CustomError = require("../../Utilities/CustomError");

const menuResolvers = {
  Query: {
    menus: async () => {
      try {
        return await Menu.find();
      } catch (error) {
        throw new CustomError("Error fetching menus: " + error.message);
      }
    },
    menu: async (_, { id }) => {
      try {
        const menu = await Menu.findById(id);
        if (!menu) {
          throw new CustomError(`Menu with ID ${id} not found`);
        }
        return menu;
      } catch (error) {
        throw new CustomError("Error fetching menu: " + error.message);
      }
    },
  },
  Mutation: {
    createMenu: async (_, { name, isCouponEnabled }, context) => {
      try {
        const company = await Company.findById(context.user.company);
        if (!company) {
          throw new CustomError("Company not found");
        }

        const menuInstance = new Menu({
          name,
          isCouponEnabled,
          company: company._id,
        });

        await menuInstance.save();
        return menuInstance;
      } catch (error) {
        throw new CustomError("Error creating menu: " + error.message);
      }
    },

    updateMenu: async (_, { id, name, isCouponEnabled }) => {
      try {
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (isCouponEnabled !== undefined)
          updates.isCouponEnabled = isCouponEnabled;

        const updatedMenu = await Menu.findByIdAndUpdate(id, updates, {
          new: true,
        });
        if (!updatedMenu) {
          throw new CustomError(`Menu with ID ${id} not found`);
        }
        return updatedMenu;
      } catch (error) {
        throw new CustomError("Error updating menu: " + error.message);
      }
    },

    deleteMenu: async (_, { id }) => {
      try {
        const result = await Menu.findByIdAndDelete(id);
        if (!result) {
          throw new CustomError(`Menu with ID ${id} not found`);
        }
        return true;
      } catch (error) {
        throw new CustomError("Error deleting menu: " + error.message);
      }
    },
  },
};

module.exports = menuResolvers;
