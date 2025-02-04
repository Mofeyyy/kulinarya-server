// Import Express JS
const express = require("express");
const app = express();

// Import dotenv for Environment Variables
require("dotenv").config();

// Connect to Database
const connectDB = require("./config/database");
connectDB().then(() => {
  // If database is connected start listening to port 4000
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
});

// Middlewares
// Convert all requests to JSON file
app.use(express.json());

// For accessing backend on a different domain
const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type"],
  })
);

// Log all requests in console
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// Respond that the backend is running
app.get("/", (req, res) => {
  res.send("Backend is running");
});
