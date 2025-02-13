const Reaction = require("../models/reactionModel");
const Recipe = require("../models/recipeModel");

/**
 * Add or Update a Recipe Reaction
 */
const addRecipeReaction = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { reaction } = req.body;
    const byUser = req.user._id; // ✅ Use authenticated user ID

    // ✅ Check if recipe exists
    const recipeExists = await Recipe.findById(recipeId);
    if (!recipeExists) {
      return res.status(404).json({ message: "Recipe not found." });
    }

    // ✅ Check if the reaction already exists
    let existingReaction = await Reaction.findOne({ fromPost: recipeId, byUser });

    if (existingReaction) {
      if (existingReaction.deletedAt) {
        existingReaction.deletedAt = null; // ✅ Restore soft-deleted reaction
      }
      existingReaction.reaction = reaction;
      await existingReaction.save();
      return res.status(200).json({ message: "Reaction updated", reaction: existingReaction });
    }

    // ✅ Create a new reaction
    const newReaction = await Reaction.create({ fromPost: recipeId, byUser, reaction });
    res.status(201).json({ message: "Reaction added", reaction: newReaction });

  } catch (error) {
    console.error("Add Reaction Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * Update a Recipe Reaction
 */
const updateRecipeReaction = async (req, res) => {
  try {
    const { reactionId } = req.params;
    const { reaction } = req.body;
    const byUser = req.user._id; // ✅ Use authenticated user ID

    // ✅ Find reaction by ID and ensure it's made by the same user
    let existingReaction = await Reaction.findOne({ _id: reactionId, byUser });

    if (!existingReaction) {
      return res.status(404).json({ message: "Reaction not found" });
    }

    // ✅ Only update the reaction field if provided
    if (reaction) {
      existingReaction.reaction = reaction;
    }

    await existingReaction.save();
    res.status(200).json({ message: "Reaction updated successfully", reaction: existingReaction });

  } catch (error) {
    console.error("Update Reaction Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * Soft Delete a Recipe Reaction
 */
const softDeleteRecipeReaction = async (req, res) => {
  try {
    const { reactionId } = req.params;
    const byUser = req.user._id; // ✅ Use authenticated user ID

    const reaction = await Reaction.findOne({ _id: reactionId, byUser });

    if (!reaction) {
      return res.status(404).json({ message: "Reaction not found" });
    }

    reaction.deletedAt = new Date();
    await reaction.save();

    res.status(200).json({ message: "Reaction deleted", reaction });

  } catch (error) {
    console.error("Delete Reaction Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  addRecipeReaction,
  updateRecipeReaction,
  softDeleteRecipeReaction
};
