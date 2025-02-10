const express = require("express");
const router = express.Router();
const {
  postNewRecipe,
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
router.post("/", postNewRecipe);
router.patch("/:recipeId", updateRecipe);
router.get("/", getAllApprovedRecipes);
router.delete("/:recipeId/soft-delete", softDeleteRecipe);

// Recipe Moderation
router.get("/pending", getPendingRecipes);
router.patch("/:recipeId/status", updateRecipeStatus);

// Feature Recipe
router.get("/featured", getFeaturedRecipes);
router.patch("/:recipeId/feature", featureRecipe);

// Viewing Recipe
router.post("/:recipeId/view", addRecipeView);
router.get("/:recipeId", getRecipeById);

// Recipe Reactions
router.post("/:recipeId/reactions", addRecipeReaction);
router.patch("/:recipeId/reactions/update", updateRecipeReaction);
router.delete("/:recipeId/reactions/soft-delete", softDeleteRecipeReaction);

// Recipe Comments
router.post("/:recipeId/comments", addRecipeComment);
router.patch("/:recipeId/comments/update", updateRecipeComment);
router.delete("/:recipeId/comments/soft-delete", softDeleteRecipeComment);

module.exports = router;
