const express = require("express");
const router = express.Router();
const { authMiddleware, checkRole } = require("../middlewares/authMiddleware"); // Import middleware

const {
  postNewRecipe,
  updateRecipe,
  getAllApprovedRecipes,
  getRecipeById,
  getFeaturedRecipes,
  getPendingRecipes,
  featureRecipe,
  softDeleteRecipe,
} = require("../controllers/recipeController");


// Recipe Management (Protected)
router.post("/", authMiddleware, postNewRecipe);
// Requires login
router.patch("/:recipeId", authMiddleware, updateRecipe); // Requires login
router.delete("/:recipeId/soft-delete", authMiddleware, softDeleteRecipe); // Requires login

// Recipe Moderation (Protected - Only Admin & Content Creators)
router.get("/pending", authMiddleware, checkRole(["admin", "creator"]), getPendingRecipes);
router.patch("/:recipeId/feature", authMiddleware, checkRole(["admin", "creator"]), featureRecipe);

// Viewing Recipes (Public)
router.get("/approved", getAllApprovedRecipes); // Public
router.get("/featured", getFeaturedRecipes); // Public
router.get("/:recipeId", getRecipeById); // Public

module.exports = router;
