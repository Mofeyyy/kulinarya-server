import express from "express";

// Imported Controllers
import {
  addRecipeReaction,
  updateRecipeReaction,
  softDeleteRecipeReaction,
} from "../controllers/reactionController.js";

// Imported Middlewares
import authenticateUser from "../middleware/authenticateUser.js";

// ! ------------------------------------------------------------ !

// TODO: Add GET route to fetch all reactions

const router = express.Router();


router.post("/:recipeId", authenticateUser, addRecipeReaction);  // ✅ Authenticated
router.patch("/:reactionId", authenticateUser, updateRecipeReaction)
router.delete("/:reactionId/soft-delete", authenticateUser, softDeleteRecipeReaction);  // ✅ Authenticated

export default router;
