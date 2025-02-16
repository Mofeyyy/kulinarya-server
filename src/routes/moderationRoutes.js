import express from "express";

// Imported Controllers
import {
  moderatePost,
  getModerationHistory,
  updateModeration,
  softDeleteModeration,
} from "../controllers/moderationController.js";

const router = express.Router();

// Moderation Management
router.post("/", moderatePost); // Approve/Reject Recipes
router.put("/:moderationId", updateModeration); // Update Moderation Decision
router.delete("/:id/soft-delete", softDeleteModeration); // Delete Moderation Record

export default router;
