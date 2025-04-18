const Notification = require("../../Model/notificationModel");

const notificationResolver = {
  Query: {
    getAllNotification: async () => {
      try {
        return await Notification.find().sort({ createdAt: -1 });
      } catch (err) {
        throw new Error("Error fetching messages");
      }
    },
  },
};

module.exports = notificationResolver;
