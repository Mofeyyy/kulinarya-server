import express from "express";

// Imported Controllers
import {
  trackPostView,
  getPostViews,
  getTopRecipePostViews,
} from "../controllers/postViewController.js";

import authenticateUser from "../middleware/authenticateUser.js";

const router = express.Router();

router.post("/",authenticateUser.optional, trackPostView); // Track Recipe Views by Users & Guests
router.get("/top", getTopRecipePostViews); // Get Top Viewed Recipes
router.get("/:recipeId", getPostViews); // Get Views for a Specific Recipe

export default router;
