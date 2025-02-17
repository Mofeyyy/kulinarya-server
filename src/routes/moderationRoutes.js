import express from "express";

// Imported Controllers
import {
  moderatePost,
  updateModeration,
  softDeleteModeration,
} from "../controllers/moderationController.js";

// Imported Middlewares
import authenticateUser from "../middleware/authenticateUser.js";
import checkRole from "../middleware/checkRole.js";

const router = express.Router();

// Moderation Management
router.patch("/:recipeId/moderate", authenticateUser, checkRole(["admin", "creator"]), moderatePost); // Approve/Reject Recipes
router.patch("/:recipeId/moderation", authenticateUser, checkRole(["admin", "creator"]), updateModeration); // Update Moderation Decision
router.delete("/:moderationId/soft-delete", authenticateUser, checkRole(["admin", "creator"]),  softDeleteModeration); // Delete Moderation Record

export default router;