import { Schema, model } from "mongoose";
import mongoose from "mongoose";

// Imported Models
import Recipe from "./recipeModel.js";
import Notification from "./notificationModel.js";

// Imported Validations
import {
  createModerationSchema,
  updateModerationSchema,
} from "../validations/moderationValidations.js";

// Imported Utility
import CustomError from "../utils/customError.js";
import { validateObjectId } from "../utils/validators.js";

const ModerationSchema = new Schema(
  {
    forPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },

    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "pending",
    },

    notes: {
      type: String,
      default: "",
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },

  { timestamps: true }
);

ModerationSchema.statics = {
  // Create New Moderation
  async createModeration(recipeId) {
    createModerationSchema.parse({ forPost: recipeId });

    const moderationExists = await this.findOne({ forPost: recipeId });

    if (moderationExists)
      throw new CustomError("Moderation already exists for this recipe.", 400);

    const newModeration = await this.create({
      forPost: recipeId,
    });

    return newModeration;
  },

  // Handle Post Moderation
  async moderatePost(req) {
    const { moderationId } = req.params;
    const { status, notes } = req.body;
    const moderatorId = req.user.userId;
    const moderatorFirstName = req.user.firstName;

    validateObjectId(moderationId, "moderation");

    const existingModeration = await this.findById(moderationId).populate(
      "forPost",
      "_id title byUser"
    );
    if (!existingModeration) throw new CustomError("Moderation not found", 404);

    const recipeModeratedId = existingModeration.forPost._id.toString();
    const recipeModeratedTitle = existingModeration.forPost.title;
    const recipeModeratedOwnerId = existingModeration.forPost.byUser.toString();

    validateObjectId(recipeModeratedId, "Recipe");
    validateObjectId(recipeModeratedOwnerId, "User");

    // Prevent moderators from moderating their own recipes
    if (recipeModeratedOwnerId === moderatorId) {
      throw new CustomError("You cannot moderate your own recipe.", 403);
    }

    const moderationData = updateModerationSchema.parse({
      status,
      notes,
    });

    if (
      existingModeration.status !== moderationData.status ||
      existingModeration.notes !== moderationData.notes
    ) {
      existingModeration.set({
        status: moderationData.status,
        notes: moderationData.notes,
        moderatedBy: moderatorId,
      });

      const updatedModeration = await existingModeration.save();

      const notification = await Notification.handleModerationNotification({
        byUser: {
          userInteractedId: moderatorId,
          userInteractedFirstName: moderatorFirstName,
        },
        fromPost: {
          recipeId: recipeModeratedId,
          recipeTitle: recipeModeratedTitle,
          recipeOwnerId: recipeModeratedOwnerId,
        },
        additionalData: {
          moderationStatus: moderationData.status,
          moderationNotes: moderationData.notes,
        },
      });

      return { moderation: updatedModeration, notification };
    }

    // If no changes, return the existing moderation without updates
    return { moderation: existingModeration };
  },

  async fetchSpecificModeration(req) {
    const { recipeId } = req.params;

    validateObjectId(recipeId, "Recipe");

    // Find the moderation for the given recipeId
    const existingModeration = await this.findOne({
      forPost: recipeId,
    })
      .populate("forPost", "_id title byUser")
      .populate("moderatedBy", "_id firstName lastName");

    if (!existingModeration) throw new CustomError("Moderation not found", 404);

    return existingModeration;
  },

  async fetchPendingModerationCount(req) {
    const userInteractedRole = req.user?.role;

    if (userInteractedRole !== "admin" && userInteractedRole !== "creator")
      throw new CustomError("Unauthorized Access", 403);

    const pendingModerationCount = await this.countDocuments({
      status: "pending",
    });

    return pendingModerationCount;
  },
};

// For Counting User Pending Recipes
ModerationSchema.statics.countPendingModerationsForUser = async function (
  userId
) {
  const result = await this.aggregate([
    {
      $lookup: {
        from: "recipes",
        localField: "forPost",
        foreignField: "_id",
        as: "recipes",
      },
    },
    {
      $unwind: {
        path: "$recipes",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        "recipes.byUser": new mongoose.Types.ObjectId(userId),
        status: "pending",
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
      },
    },
  ]);

  return result.length > 0 ? result[0].count : 0;
};

const Moderation = model("Moderation", ModerationSchema);
export default Moderation;
