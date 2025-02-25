import express from "express";
import  { addRecipeReaction, updateRecipeReaction, softDeleteRecipeReaction } from "../controllers/reactionController.js";

// Imported Middlewares
import authenticateUser from "../middleware/authenticateUser.js";

const router = express.Router();

router.post("/:recipeId", authenticateUser, addRecipeReaction);  // ✅ Authenticated
router.patch("/:reactionId", authenticateUser, updateRecipeReaction)
router.delete("/:reactionId/soft-delete", authenticateUser, softDeleteRecipeReaction);  // ✅ Authenticated

export default router
