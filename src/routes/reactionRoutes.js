import express from "express";

// Imported Controllers
import {
  toggleReaction,
  fetchAllReactions,
  getTopReactedPost,
  getOverallReactions
} from "../controllers/reactionController.js";

// Imported Middlewares
import authenticateUser from "../middleware/authenticateUser.js";

//  ------------------------------------------------------------

// TODO: Add GET route to fetch all reactions
// TODO: Test toggle reaction

const router = express.Router();
router.get("/overall-reactions", getOverallReactions);
router.get("/top-reacted", getTopReactedPost);
router.get("/:recipeId", fetchAllReactions);
router.post("/:recipeId/toggle", authenticateUser, toggleReaction);


export default router;
