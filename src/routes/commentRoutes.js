import express from "express";

// Imported Routes
import {
  addRecipeComment,
  updateRecipeComment,
  softDeleteRecipeComment,
  fetchAllPostComments,
  getOverallComments
} from "../controllers/commentController.js";

// Imported Middlewares
import { authenticateUser } from "../middleware/authenticateUser.js";

// ---------------------------------------------------------------------------

const router = express.Router();
router.get("/overall-comments", getOverallComments);
router.get("/:recipeId", fetchAllPostComments);
router.post("/:recipeId", authenticateUser, addRecipeComment);
router.patch("/:commentId", authenticateUser, updateRecipeComment);
router.delete(
  "/:commentId/soft-delete",
  authenticateUser,
  softDeleteRecipeComment
);

export default router;
