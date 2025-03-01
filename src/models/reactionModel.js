import { Schema, isValidObjectId, model } from "mongoose";
import mongoose from "mongoose";

// Imported Utilities
import CustomError from "../utils/customError.js";
import { validateObjectId } from "../utils/validators.js";

// Imported Models
import Notification from "./notificationModel.js";
import Recipe from "./recipeModel.js";

// Imported Validations
import {
  addReactionSchema,
  updateReactionSchema,
} from "../validations/reactionValidation.js";

// ---------------------------------------------------------------------------

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

// Fetching Reactions - Cursor based approach (Last Fetched Timestamp)
ReactionSchema.statics.fetchAllReactions = async function (req) {
  const { recipeId } = req.params;
  const { limit = 10, cursor } = req.query;
  // cursor is the last createdAt timestamp of the last fetched reaction

  validateObjectId(recipeId, "Recipe");

  const filter = {
    fromPost: recipeId,
    $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
  };

  if (cursor) {
    filter.createdAt = { $lt: new Date(cursor) };
  } // If cursor of last comment fetched timestamp is provided, filter reactions created before that timestamp

  const reactions = await this.find(filter)
    .populate("byUser", "firstName middleName lastName profilePictureUrl")
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .lean();

  // Set if there is still cursor to fetch more comments
  const newCursor =
    reactions.length > 0 ? reactions[reactions.length - 1].createdAt : null;

  return { reactions, cursor: newCursor };
};

ReactionSchema.statics.toggleReaction = async function (req) {
  const { recipeId } = req.params;
  const newReaction = req.body.reaction;
  const userInteractedId = req.user.userId;
  const userInteractedFirstName = req.user.firstName;

  validateObjectId(recipeId, "Recipe");

  const recipe = await Recipe.findById(recipeId).select("byUser title").lean();
  if (!recipe) throw new CustomError("Recipe not found", 404);

  const recipeOwnerId = recipe.byUser.toString();
  const recipeTitle = recipe.title;

  const existingReaction = await this.findOne({
    fromPost: recipeId,
    byUser: userInteractedId,
  });

  let reactionData;
  let isSoftDeleted = false;
  let oldReaction = null;
  let isNewReaction = false;

  if (existingReaction) {
    oldReaction = existingReaction.reaction;
    const isRestoring = existingReaction.deletedAt !== null;
    const isSameReaction = existingReaction.reaction === newReaction;

    if (isRestoring) {
      // If the user reaction is soft deleted and the user reacted again
      updateReactionSchema.parse({ reaction: newReaction });
      existingReaction.reaction = newReaction;
      existingReaction.deletedAt = null;
    } else if (isSameReaction) {
      // Soft Delete the reaction if the user reacted the same existing reaction
      existingReaction.reaction = null;
      existingReaction.deletedAt = new Date();
      isSoftDeleted = true;
    } else {
      // Update the reaction if the user reacted a different reaction
      updateReactionSchema.parse({ reaction: newReaction });
      existingReaction.reaction = newReaction;
    }

    reactionData = await existingReaction.save();
  } else {
    // If no existing reaction, create a new one
    const newReactionData = addReactionSchema.parse({
      fromPost: recipeId,
      byUser: userInteractedId,
      reaction: newReaction,
    });
    isNewReaction = true;

    reactionData = await this.create(newReactionData);
  }

  const notificationData = await Notification.handleNotification({
    byUser: {
      userInteractedId,
      userInteractedFirstName,
    },
    fromPost: {
      recipeId,
      recipeOwnerId,
      recipeTitle,
    },
    type: "reaction",
    additionalData: { newReaction, oldReaction },
    isSoftDeleted,
  });

  return { reactionData, notificationData, isNewReaction, isSoftDeleted };
};

const Reaction = model("Reaction", ReactionSchema);
export default Reaction;
