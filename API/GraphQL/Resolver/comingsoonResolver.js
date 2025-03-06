const ComingSoon = require("../../Model/comingsoonModel");
const CustomError = require("../../Utilities/CustomError");

// resolvers.js
const comingsoonResolver = {
  Query: {
    getAllEmails: async () => {
      return await ComingSoon.find().sort({ createdAt: -1 });
    },
  },
  Mutation: {
    notifyMe: async (_, { email }) => {
      try {
        // Check if the email already exists in the database
        const existingEmail = await ComingSoon.findOne({ email });

        if (existingEmail) {
          return "This email is already registered.";
        }

        // Save the email to the database
        const newEntry = new ComingSoon({ email });
        await newEntry.save();

        return `Thank you! We will notify you at ${email} when we launch.`;
      } catch (error) {
        console.log("Error saving email:", error);
        throw new CustomError(
          "Failed to save your email. Please try again later."
        );
      }
    },
  },
};

module.exports = comingsoonResolver;
