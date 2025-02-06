const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log(`Connection Error: ${error.message}`);
    // Terminate Process
    process.exit(1);
  }
};

module.exports = connectDB;
