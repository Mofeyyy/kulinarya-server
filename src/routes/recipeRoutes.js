const express = require("express");
const router = express.Router();
const {
  createRecipe,
  updateRecipe,
  getAllApprovedRecipes,
  getRecipeById,
  getFeaturedRecipes,
  getPendingRecipes,
  updateRecipeStatus,
  featureRecipe,
  softDeleteRecipe,
  addRecipeView,
  addRecipeReaction,
  updateRecipeReaction,
  softDeleteRecipeReaction,
  addRecipeComment,
  updateRecipeComment,
  softDeleteRecipeComment,
} = require("../controllers/recipeController");

// Recipe Management
router.post("/", createRecipe);
router.patch("/:recipeId", updateRecipe);
router.get("/", getAllApprovedRecipes);
router.get("/:recipeId", getRecipeById);

// Featured and Pending Recipes
router.get("/featured", getFeaturedRecipes);
router.get("/pending", getPendingRecipes);
router.patch("/:recipeId/status", updateRecipeStatus);
router.patch("/:recipeId/feature", featureRecipe);

// Soft Delete
router.delete("/:recipeId/soft-delete", softDeleteRecipe);

// Views, Reactions, and Comments
router.post("/:recipeId/view", addRecipeView);
router.post("/:recipeId/reactions", addRecipeReaction);
router.patch("/:recipeId/reactions/update", updateRecipeReaction);
router.delete("/:recipeId/reactions/soft-delete", softDeleteRecipeReaction);
router.post("/:recipeId/comments", addRecipeComment);
router.patch("/:recipeId/comments/update", updateRecipeComment);
router.delete("/:recipeId/comments/soft-delete", softDeleteRecipeComment);

module.exports = router;
