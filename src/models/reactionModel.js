import { Schema, model } from "mongoose";
import mongoose from "mongoose";
import CustomError from "../utils/customError.js";
import Notification from "./notificationModel.js";
import Recipe from "./recipeModel.js"; // Import Recipe to get the title
import User from "./userModel.js";
import { reactionValidationSchema } from "../validations/reactionValidation.js"; // ✅ Import Zod Schema

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

// 🔹 Static Methods
// Add a New Reaction
ReactionSchema.statics.addReaction = async function (
  userId,
  postId,
  reactionType
) {
  const existingReaction = await this.findOne({
    fromPost: postId,
    byUser: userId,
    deletedAt: null,
  });

  if (existingReaction) {
    const result = await this.updateReactionType(existingReaction._id, reactionType, userId);
    if (result.reaction) {
      await this.handleReactionNotification(userId, postId, reactionType, null);
    }
    return result;
  } else {
    const validatedData = reactionValidationSchema.parse({
      fromPost: postId,
      byUser: userId,
      reaction: reactionType,
    });

    const newReaction = await this.create(validatedData);
    await this.handleReactionNotification(userId, postId, reactionType, null); // First-time reaction
    return newReaction;
  }
};

// Update Reaction Type
ReactionSchema.statics.updateReactionType = async function (
  reactionId,
  newReactionType,
  userId
) {
  if (!newReactionType) {
    throw new CustomError("Invalid reaction type", 400);
  }

  const reaction = await this.findById(reactionId);
  if (!reaction) {
    throw new CustomError("Reaction not found", 404);
  }

  const previousReactionType = reaction.reaction;

  if (previousReactionType === newReactionType) {
    // Soft delete the reaction and the associated notification
    await this.softDeleteReaction(reactionId);
    return { message: "Reaction deleted successfully" };
  }

  reaction.reaction = newReactionType;
  await reaction.save();

  await this.handleReactionNotification(
    userId,
    reaction.fromPost,
    newReactionType,
    previousReactionType
  );

  return reaction;
};

// Soft Delete Reaction
ReactionSchema.statics.softDeleteReaction = async function (reactionId) {
  const reactionToDelete = await this.findById(reactionId);
  if (!reactionToDelete) {
    throw new CustomError("Reaction not found", 404);
  }

  reactionToDelete.deletedAt = new Date();
  await reactionToDelete.save();

  await Notification.softDeleteNotification({
    fromPost: reactionToDelete.fromPost,
    byUser: reactionToDelete.byUser,
    type: "reaction",
  });

  return { message: "Reaction successfully soft deleted" };
};

// Handle Notifications for Reaction
ReactionSchema.statics.handleReactionNotification = async function (
  reactingUserId,
  postId,
  newReactionType,
  oldReactionType
) {
  const recipe = await Recipe.findById(postId);
  if (!recipe) throw new CustomError("Recipe not found", 404);

  const recipeTitle = recipe.title;
  const existingNotification = await Notification.findOne({
    byUser: reactingUserId,
    fromPost: postId,
    type: "reaction",
  });

  let notificationContent = "";

  if (existingNotification && existingNotification.deletedAt === null) {
    if (oldReactionType) {
      const reactorUser = await User.findById(reactingUserId);
      notificationContent = `${reactorUser.firstName} changed their reaction from (${oldReactionType}) to (${newReactionType}) on your recipe: ${recipeTitle}.`;
    } else {
      const reactorUser = await User.findById(reactingUserId);
      notificationContent = `${reactorUser.firstName} reacted (${newReactionType}) on your recipe: ${recipeTitle}.`;
    }

    existingNotification.content = notificationContent;
    existingNotification.isRead = false;
    existingNotification.updatedAt = new Date(); // Update timestamp
    await existingNotification.save();
  } else {
    if (recipe.byUser._id.toString() !== reactingUserId) {
      const reactorUser = await User.findById(reactingUserId);
      notificationContent = `${reactorUser.firstName} reacted (${newReactionType}) on your recipe: ${recipeTitle}.`;
      if (existingNotification && existingNotification.deletedAt !== null) {
        existingNotification.content = notificationContent;
        existingNotification.isRead = false;
        existingNotification.deletedAt = null;
        existingNotification.updatedAt = new Date(); // Update timestamp
        await existingNotification.save();
      } else {
        await Notification.createNotification({
          forUser: recipe.byUser._id.toString(),
          byUser: reactingUserId,
          fromPost: postId,
          type: "reaction",
          content: notificationContent,
        });
      }
    }
  }
};

const Reaction = model("Reaction", ReactionSchema);
export default Reaction;
