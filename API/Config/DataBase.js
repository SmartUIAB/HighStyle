const mongoose = require("mongoose");

const DatabaseConnection = async () => {
  await mongoose
    .connect("mongodb://127.0.0.1:27017/HighStyle")
    .then(() => console.log(".....Database is working....."))
    .catch((er) => console.log(er.message));
};

module.exports = DatabaseConnection;
