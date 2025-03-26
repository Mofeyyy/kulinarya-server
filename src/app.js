import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

// Imported Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import reactionRoutes from "./routes/reactionRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import moderationRoutes from "./routes/moderationRoutes.js";
import postViewRoutes from "./routes/postViewRoutes.js";
import platformVisitRoutes from "./routes/platformVisitRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";

// Imported Middlewares
import errorHandler from "./middleware/errorHandler.js";
import initialLogin from "./middleware/initialLogin.js";

//  ---------------------------------------------------------------

const app = express();

dotenv.config();

app.use(express.json()); // Convert all requests to JSON file

app.use(cookieParser()); // Cookie Parser

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
); // For accessing or allowing backend on a different domain

app.use((req, _, next) => {
  console.log(req.path, req.method);
  next();
}); // Log all requests in console

app.get("/", initialLogin, (_, res) => {
  res.send("Backend is running");
}); // Respond that the backend is running

// TODO: Put Request Limiters Soon Per Routes

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/reactions", reactionRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/moderations", moderationRoutes);
app.use("/api/post-views", postViewRoutes);
app.use("/api/platform-visits", platformVisitRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/announcements", announcementRoutes);

app.use((_, res) => res.status(404).json({ error: "Not Found" }));

app.use(errorHandler); // Global Error Handler

setInterval(() => {
  console.log("Backend is running");
}, 30000);

export default app;
