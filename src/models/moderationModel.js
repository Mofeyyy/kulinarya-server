import { Schema, model } from "mongoose";
import mongoose from "mongoose";
import Recipe from "./recipeModel.js";
import Notification from "./notificationModel.js";

const ModerationSchema = new Schema(
  {
    forPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      required: true,
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

  { timestamps: true } // Automatically includes createdAt and updatedAt fields
);

ModerationSchema.statics = {
  // 🔹 Static Method: Check User Authorization
  checkUserAuthorization(req) {
    if (!req.user || !req.user._id) {
      throw new Error("Unauthorized: User ID is missing.");
    }
    return req.user._id; // Return user ID for further usage
  },

  // 🔹 Static Method: Extract Recipe ID and Body Params
  extractParams(req) {
    const { recipeId } = req.params;
    const { status, notes } = req.body;
    return { recipeId, status, notes }; // Return params as an object for ease of use
  },

  // 🔹 Static Method: Find & Validate Recipe by ID
  async findRecipeById(recipeId) {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) throw new Error("Recipe not found.");
    return recipe;
  },

  // 🔹 Static Method: Find & Validate Moderation Entry
  async findModerationEntry(recipeId) {
    const moderationEntry = await this.findOne({ forPost: new mongoose.Types.ObjectId(recipeId) });
    if (!moderationEntry) throw new Error("No moderation entry found for this recipe.");
    return moderationEntry;
  },

  // 🔹 Static Method: Validate Moderation Status
  validateStatus(status) {
    if (!["approved", "rejected"].includes(status)) {
      throw new Error("Invalid status. Must be 'approved' or 'rejected'.");
    }
  },

  // 🔹 Static Method: Create a Notification
  async createNotification(userId, content) {
    return await Notification.create({
      forUser: userId,
      content,
      type: "moderation",
    });
  },

  // 🔹 Static Method: Update Moderation Entry
  async updateModerationEntry(moderationEntry, status, notes, userId) {
    moderationEntry.status = status;
    moderationEntry.notes = notes || "Moderation updated.";
    moderationEntry.moderatedBy = userId;
    moderationEntry.updatedAt = new Date();
    await moderationEntry.save();
  },

  // 🔹 Static Method: Soft Delete Moderation Entry
  async softDeleteModerationEntry(moderationId) {
    const moderationEntry = await this.findById(moderationId);
    if (!moderationEntry) throw new Error("Moderation record not found.");

    moderationEntry.deletedAt = new Date();
    await moderationEntry.save();
  }
};

const Moderation = model("Moderation", ModerationSchema);
export default Moderation;
