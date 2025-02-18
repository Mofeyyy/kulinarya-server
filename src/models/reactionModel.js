import { Schema, model } from "mongoose";
import mongoose from "mongoose";

const ReactionSchema = new Schema(
  {
    fromPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },

    byUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reaction: {
      type: String,
      enum: ["heart", "drool", "neutral", null],
      default: null,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// 🔹 Static Methods for Reusability

ReactionSchema.statics.extractReactionParams = function (req) {
  // Extract the necessary parameters from the request
  const { recipeId } = req.params;
  const { reaction } = req.body;
  const byUser = req.user.id; // Use authenticated user ID

  return { recipeId, reaction, byUser };
};

// Check if reaction exists for a specific recipe by a user
ReactionSchema.statics.findReactionByPostAndUser = async function (recipeId, byUser) {
  return await this.findOne({ fromPost: recipeId, byUser });
};

// Create a new Reaction
ReactionSchema.statics.createReaction = async function (data) {
  return await this.create(data);
};

// Update a Reaction (Restores soft-deleted reaction)
ReactionSchema.statics.updateReaction = async function (reactionId, reaction, byUser) {
  const existingReaction = await this.findOne({ _id: reactionId, byUser });
  if (!existingReaction) throw new Error("Reaction not found");

  if (existingReaction.deletedAt) {
    existingReaction.deletedAt = null; // Restore soft-deleted reaction
  }

  existingReaction.reaction = reaction;
  return await existingReaction.save();
};

// Soft Delete a Reaction
ReactionSchema.statics.softDeleteReaction = async function (reactionId, byUser) {
  const reaction = await this.findOne({ _id: reactionId, byUser });
  if (!reaction) throw new Error("Reaction not found");

  reaction.deletedAt = new Date();
  return await reaction.save();
};

// General Method for Handling Reactions
ReactionSchema.statics.handleReaction = async function (recipeId, byUser, reaction = null) {
  // Check if reaction exists
  let existingReaction = await this.findReactionByPostAndUser(recipeId, byUser);

  if (existingReaction) {
    // Update if it exists
    return await this.updateReaction(existingReaction._id, reaction, byUser);
  }

  // Otherwise create a new reaction
  return await this.createReaction({ fromPost: recipeId, byUser, reaction });
};

const Reaction = model("Reaction", ReactionSchema);
export default Reaction;
