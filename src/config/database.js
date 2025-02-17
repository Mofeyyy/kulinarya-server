import { connect } from "mongoose";

const connectDB = async () => {
  try {
    await connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log(`Connection Error: ${error.message}`);
    // Terminate Process
    process.exit(1);
  }
};

export default connectDB;