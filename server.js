// Import dotenv for Environment Variables
require("dotenv").config();

// Connect to Database
const connectDB = require("./src/config/database");
const app = require("./src/app");
connectDB().then(() => {
  // If database is connected start listening to port 4000
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
});
