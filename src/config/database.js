import { connect } from "mongoose";
import { MONGO_URI } from "../utils/environmentConditions.js";

const connectDB = async () => {
  try {
    console.log(MONGO_URI);
    await connect(MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log(`Connection Error: ${error.message}`);
    // Terminate Process
    process.exit(1);
  }
};

export default connectDB;
