import Reaction from "../models/reactionModel.js";
import expressAsyncHandler from "express-async-handler";

// ✅ Add Reaction
export const addRecipeReaction = expressAsyncHandler(async (req, res) => {
  const { recipeId } = req.params;
  const { reaction } = req.body;
  const userId = req.user._id;

  const result = await Reaction.addReaction(userId, recipeId, reaction);
  res.status(201).json({ message: "Reaction added/updated successfully", result });
});

// ✅ Update Reaction
export const updateRecipeReaction = expressAsyncHandler(async (req, res) => {
  const { reactionId } = req.params;
  const newReactionType = req.body.reaction;
  const userId = req.user._id;

  const updatedReaction = await Reaction.updateReactionType(reactionId, newReactionType, userId);

  res.status(200).json({ message: "Reaction updated successfully", updatedReaction });
});

// ✅ Soft Delete Reaction
export const softDeleteRecipeReaction = expressAsyncHandler(async (req, res) => {
  const { reactionId } = req.params;

  await Reaction.softDeleteReaction(reactionId);

  res.status(200).json({ message: "Reaction deleted successfully" });
});
