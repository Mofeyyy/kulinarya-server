import dotenv from "dotenv";
import connectDB from "./src/config/database.js";
import app from "./src/app.js";

dotenv.config();

// Connect to Database
connectDB().then(() => {
  // If database is connected start listening to port 4000
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
});