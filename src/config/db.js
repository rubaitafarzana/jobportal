
const mongoose = require("mongoose");

exports.dbConfig = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);

    console.log("Database connection successful");
    console.log("Database name:", mongoose.connection.name);
  } catch (error) {
    console.log("Database connection failed:", error.message);
  }
};
