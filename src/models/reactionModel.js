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

  validateObjectId(recipeId, "Recipe");

  const filter = {
    fromPost: recipeId,
    $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
  };

  if (cursor) {
    filter.createdAt = { $lt: new Date(cursor) };
  }

  // Fetch reactions with pagination
  const reactions = await this.find(filter)
    .populate("byUser", "firstName middleName lastName profilePictureUrl")
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .lean();

  // Get total reaction count (excluding deleted)
  const totalReactions = await this.countDocuments(filter);

  // Determine if there is a next cursor
  const newCursor =
    reactions.length > 0 ? reactions[reactions.length - 1].createdAt : null;

  return { reactions, totalReactions, cursor: newCursor };
};

ReactionSchema.statics.toggleReaction = async function (req) {
  const { recipeId } = req.params;
  const newReaction = req.body.reaction;
  const userInteractedId = req.user.userId;
  const userInteractedFirstName = req.user.firstName;

  validateObjectId(recipeId, "Recipe");
  validateObjectId(userInteractedId, "User");

  const recipe = await Recipe.findById(recipeId).select("byUser title").lean();
  if (!recipe) throw new CustomError("Recipe not found", 404);

  const recipeOwnerId = recipe.byUser.toString();
  const recipeTitle = recipe.title;

  validateObjectId(recipeOwnerId, "User");

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

  const notificationData = await Notification.handleReactionNotification({
    byUser: {
      userInteractedId,
      userInteractedFirstName,
    },
    fromPost: {
      recipeId,
      recipeOwnerId,
      recipeTitle,
    },
    additionalData: { newReaction },
  });

  return { reactionData, notificationData, isNewReaction, isSoftDeleted };
};

// Fetch the top reacted post
ReactionSchema.statics.getTopReactedPost = async function () {
  const startOfMonth = new Date(new Date().setDate(1)); // First day of the current month
  const endOfMonth = new Date(); // Today's date

  const topReactedPosts = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        deletedAt: null, // Ensures only active reactions are counted
      },
    },
    {
      $group: {
        _id: "$fromPost",
        totalReactions: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "recipes",
        localField: "_id",
        foreignField: "_id",
        as: "recipe",
      },
    },
    { $unwind: "$recipe" },
    {
      $lookup: {
        from: "users",
        localField: "recipe.byUser",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "comments",
        let: { postId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$fromPost", "$$postId"] } } },
          { $count: "totalComments" },
        ],
        as: "comments",
      },
    },
    {
      $lookup: {
        from: "postviews",
        let: { postId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$fromPost", "$$postId"] } } },
          { $count: "totalViews" },
        ],
        as: "views",
      },
    },
    {
      $addFields: {
        totalComments: {
          $ifNull: [{ $arrayElemAt: ["$comments.totalComments", 0] }, 0],
        },
        totalViews: {
          $ifNull: [{ $arrayElemAt: ["$views.totalViews", 0] }, 0],
        },
      },
    },
    {
      $project: {
        _id: "$recipe._id",
        title: "$recipe.title",
        mainPictureUrl: "$recipe.mainPictureUrl", // Added mainPictureUrl
        totalReactions: 1,
        totalComments: 1,
        totalViews: 1,
        "byUser.firstName": "$user.firstName",
        "byUser.lastName": "$user.lastName",
      },
    },
    { $sort: { totalReactions: -1 } },
    { $limit: 10 },
  ]);

  return { topReactedPosts };
};

ReactionSchema.statics.getOverallReactions = async function () {
  const overallReactions = await this.aggregate([
    {
      $match: {
        deletedAt: null, // Excludes soft-deleted reactions
      },
    },
    {
      $group: {
        _id: "$reaction",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        reaction: "$_id",
        count: 1,
      },
    },
  ]);

  // Convert array to an object format for easier frontend handling
  const reactionStats = {
    heart: 0,
    drool: 0,
    neutral: 0,
  };

  overallReactions.forEach(({ reaction, count }) => {
    if (reaction) reactionStats[reaction] = count;
  });

  return reactionStats;
};


const Reaction = model("Reaction", ReactionSchema);
export default Reaction;
