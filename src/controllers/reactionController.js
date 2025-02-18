import Reaction from "../models/reactionModel.js";
import Recipe from "../models/recipeModel.js";

/**
 * Add or Update a Recipe Reaction
 */
export const addRecipeReaction = async (req, res) => {
  try {
    const { recipeId, reaction, byUser } = await Reaction.extractReactionParams(req);

    // Check if recipe exists
    const recipeExists = await Recipe.findById(recipeId);
    if (!recipeExists) {
      return res.status(404).json({ message: "Recipe not found." });
    }

    // Handle reaction (either create or update based on existing)
    const updatedReaction = await Reaction.handleReaction(recipeId, byUser, reaction);

    return res.status(updatedReaction._id ? 200 : 201).json({
      message: updatedReaction._id ? "Reaction updated" : "Reaction added",
      reaction: updatedReaction,
    });
  } catch (error) {
    console.error("Add Reaction Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * Update a Recipe Reaction
 */
export const updateRecipeReaction = async (req, res) => {
  try {
    const { reactionId } = req.params;
    const { reaction, byUser } = await Reaction.extractReactionParams(req);

    const updatedReaction = await Reaction.updateReaction(reactionId, reaction, byUser);
    res.status(200).json({ message: "Reaction updated successfully", reaction: updatedReaction });
  } catch (error) {
    console.error("Update Reaction Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * Soft Delete a Recipe Reaction
 */
export const softDeleteRecipeReaction = async (req, res) => {
  try {
    const { reactionId } = req.params;
    const { byUser } = await Reaction.extractReactionParams(req);

    const deletedReaction = await Reaction.softDeleteReaction(reactionId, byUser);
    res.status(200).json({ message: "Reaction deleted", reaction: deletedReaction });
  } catch (error) {
    console.error("Delete Reaction Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
