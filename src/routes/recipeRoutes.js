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
router.delete("/:recipeId/soft-delete", softDeleteRecipe);

// Recipe Moderation
router.get("/pending", getPendingRecipes);
router.patch("/:recipeId/status", updateRecipeStatus);

// Feature Recipe
router.get("/featured", getFeaturedRecipes);
router.patch("/:recipeId/feature", featureRecipe);

// Recipe Views
router.post("/:recipeId/view", addRecipeView);

// Recipe Reactions
router.post("/:recipeId/reactions", addRecipeReaction);
router.patch("/:recipeId/reactions/update", updateRecipeReaction);
router.delete("/:recipeId/reactions/soft-delete", softDeleteRecipeReaction);

// Recipe Comments
router.post("/:recipeId/comments", addRecipeComment);
router.patch("/:recipeId/comments/update", updateRecipeComment);
router.delete("/:recipeId/comments/soft-delete", softDeleteRecipeComment);

module.exports = router;
