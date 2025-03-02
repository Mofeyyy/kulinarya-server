import dotenv from "dotenv";
import connectDB from "./src/config/database.js";
import app from "./src/app.js";

dotenv.config();

// Connect to Database
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
  } catch (error) {
    console.error("Database connection failed:", error);

    process.exit(1); // Exit process if database connection fails
  }
};

startServer();
