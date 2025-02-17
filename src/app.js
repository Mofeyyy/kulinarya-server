import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import dotenv from "dotenv";
dotenv.config();


// Imported Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import reactionRoutes from "./routes/reactionRoutes.js"
import moderationRoutes from "./routes/moderationRoutes.js";
import postViewRoutes from "./routes/postViewRoutes.js";
import platformVisitRoutes from "./routes/platformVisitRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";

// Imported Middlewares
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(express.json()); // Convert all requests to JSON file

app.use(cookieParser()); // Cookie Parser

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type"],
  })
); // For accessing or allowing backend on a different domain

app.use((req, _, next) => {
  console.log(req.path, req.method);
  next();
}); // Log all requests in console

app.get("/", (_, res) => {
  res.send("Backend is running");
}); // Respond that the backend is running

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/reactions", reactionRoutes);
app.use("/api/moderations", moderationRoutes);
app.use("/api/post-views", postViewRoutes);
app.use("/api/platform-visits", platformVisitRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/announcements", announcementRoutes);

app.use(errorHandler); // Global Error Handler

export default app;
