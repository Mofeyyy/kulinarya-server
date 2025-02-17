import express from "express";

// Imported Controllers
import {
  postNewRecipe,
  updateRecipe,
  getAllApprovedRecipes,
  getRecipeById,
  getFeaturedRecipes,
  getPendingRecipes,
  featureRecipe,
  softDeleteRecipe
} from "../controllers/recipeController.js";

// Imported Middlewares
import { authenticateUser } from "../middleware/authenticateUser.js";
import checkRole from "../middleware/checkRole.js";

const router = express.Router();

// Recipe Management (Protected)
router.post("/", authenticateUser, postNewRecipe);
// Requires login
router.patch("/:recipeId", authenticateUser, updateRecipe); // Requires login
router.delete("/:recipeId/soft-delete", authenticateUser, softDeleteRecipe); // Requires login

// Recipe Moderation (Protected - Only Admin & Content Creators)
router.get("/pending", authenticateUser, checkRole(["admin", "creator"]), getPendingRecipes);
router.patch("/:recipeId/feature", authenticateUser, checkRole(["admin", "creator"]), featureRecipe);

// Viewing Recipes (Public)
router.get("/approved", getAllApprovedRecipes); // Public
router.get("/featured", getFeaturedRecipes); // Public
router.get("/:recipeId", getRecipeById); // Public


export default router;