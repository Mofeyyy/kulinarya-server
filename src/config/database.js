import { connect } from "mongoose";
import "dotenv/config";

const MONGO_URI =
  process.env.NODE_ENV === "prod"
    ? process.env.MONGO_URI_PROD
    : process.env.MONGO_URI_DEV;

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
