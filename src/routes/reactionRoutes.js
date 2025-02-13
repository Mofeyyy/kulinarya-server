const express = require("express");
const { addRecipeReaction, updateRecipeReaction, softDeleteRecipeReaction } = require("../controllers/reactionController");

const router = express.Router();

// Add a new reaction
router.post("/:recipeId", addRecipeReaction);

// Update an existing reaction
router.patch("/:reactionId", updateRecipeReaction);

// Soft delete a reaction
router.delete("/:reactionId", softDeleteRecipeReaction);

module.exports = router;
