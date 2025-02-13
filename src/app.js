const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

// Middlewares - this controls or modify all the requests and responses

app.use(express.json()); // Convert all requests to JSON file

app.use(cookieParser());

const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type"],
  })
); // For accessing or allowing backend on a different domain

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
}); // Log all requests in console

app.get("/", (req, res) => {
  res.send("Backend is running");
}); // Respond that the backend is running

// Routes
// Authentication Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// User Routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// Recipe Routes
const recipeRoutes = require("./routes/recipeRoutes");
app.use("/api/recipes", recipeRoutes);

// Moderation Routes
const moderationRoutes = require("./routes/moderationRoutes");
app.use("/api/moderations", moderationRoutes);

// Post View Routes
const postViewRoutes = require("./routes/postViewRoutes");
app.use("/api/post-views", postViewRoutes);

// Platform Routes
const platformVisitRoutes = require("./routes/platformVisitRoutes");
app.use("/api/platform-visits", platformVisitRoutes);

// Notifications Routes
const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

// Announcements Routes
const announcementRoutes = require("./routes/announcementRoutes");
app.use("/api/announcements", announcementRoutes);

module.exports = app;
