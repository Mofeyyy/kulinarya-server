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

  // Prevent moderators from moderating their own recipes
  if (recipeModeratedOwnerId === moderatorId) {
    throw new CustomError("You cannot moderate your own recipe.", 403);
  }

  const moderationData = updateModerationSchema.parse({
    status,
    notes,
  });

  if (existingModeration.status !== moderationData.status || existingModeration.notes !== moderationData.notes) {
    existingModeration.set({
      status: moderationData.status,
      notes: moderationData.notes,
      moderatedBy: moderatorId,
    });

    const updatedModeration = await existingModeration.save();

    // ✅ Update the recipe's status in the database when approved
    if (moderationData.status === "approved") {
      await Recipe.findByIdAndUpdate(recipeModeratedId, {
        status: "approved",
      });
    } else if (moderationData.status === "rejected") {
      await Recipe.findByIdAndUpdate(recipeModeratedId, {
        status: "rejected",  // Recipe status set to rejected
      });
    }

    await Notification.handleNotification({
      byUser: {
        userInteractedId: moderatorId,
        userInteractedFirstName: moderatorFirstName,
      },
      fromPost: {
        recipeId: recipeModeratedId,
        recipeTitle: recipeModeratedTitle,
        recipeOwnerId: recipeModeratedOwnerId,
      },
      type: "moderation",
      additionalData: {
        moderationStatus: moderationData.status,
        moderationNotes: moderationData.notes,
      },
    });

    return { moderation: updatedModeration };
  }

  // If no changes, return the existing moderation without updates
  return { moderation: existingModeration };
},

};

const Moderation = model("Moderation", ModerationSchema);
export default Moderation;
