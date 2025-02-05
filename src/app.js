// Import Express JS
const express = require("express");
const app = express();

// Middlewares

app.use(express.json()); // Convert all requests to JSON file

const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type"],
  })
); // For accessing backend on a different domain

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
}); // Log all requests in console

app.get("/", (req, res) => {
  res.send("Backend is running");
}); // Respond that the backend is running

module.exports = app;
