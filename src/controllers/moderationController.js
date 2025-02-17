import Recipe from "../models/recipeModel.js";
import Moderation from "../models/moderationModel.js";
import Notification from "../models/notificationModel.js";
import mongoose from "mongoose";

/** 🔹 Utility Function: Find & Validate Recipe by ID */
export const findRecipeById = async (recipeId) => {
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) throw new Error("Recipe not found.");
  return recipe;
};

/** 🔹 Utility Function: Find & Validate Moderation Entry */
export const findModerationEntry = async (recipeId) => {
  const moderationEntry = await Moderation.findOne({ forPost: new mongoose.Types.ObjectId(recipeId) });
  if (!moderationEntry) throw new Error("No moderation entry found for this recipe.");
  return moderationEntry;
};

/** 🔹 Utility Function: Create a Notification */
export const createNotification = async (userId, content) => {
  return await Notification.create({
    forUser: userId,
    content,
    type: "moderation",
  });
};

/** ✅ Approve/Reject Recipe */
export const moderatePost = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: User ID is missing." });
    }

    const { recipeId } = req.params;
    const { status, notes } = req.body;
    const userId = req.user._id; // User ID from Auth Middleware

    // Validate status
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'approved' or 'rejected'." });
    }

    // Fetch Recipe & Moderation Entry
    const recipe = await findRecipeById(recipeId);
    const moderationEntry = await findModerationEntry(recipeId);

    // Update Recipe Status
    recipe.status = status;
    await recipe.save();

    // Update Moderation Entry
    moderationEntry.status = status;
    moderationEntry.notes = notes || "Moderation updated.";
    moderationEntry.moderatedBy = userId;
    moderationEntry.updatedAt = new Date();
    await moderationEntry.save();

    // Send Notification if Approved
    if (status === "approved") {
      await createNotification(recipe.byUser, `Your recipe \"${recipe.title}\" has been approved! 🎉`);
    }

    res.status(200).json({ message: `Recipe ${status}.`, recipe });
  } catch (error) {
    console.error("Moderation Error:", error.message);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/** ✅ Update Moderation Decision */
export const updateModeration = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: User ID is missing." });
    }

    const { recipeId } = req.params;
    const { status, notes } = req.body;
    const userId = req.user._id; // User ID from Auth Middleware

    // Fetch Moderation Entry
    const moderationEntry = await findModerationEntry(recipeId);

    // Update Notes & Timestamp
    moderationEntry.status = status;
    moderationEntry.notes = notes || "Moderation status and notes updated.";
    moderationEntry.moderatedBy = userId;
    moderationEntry.updatedAt = new Date();
    await moderationEntry.save();

    res.status(200).json({ message: "Moderation notes updated successfully." });
  } catch (error) {
    console.error("Update Moderation Error:", error.message);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/** ✅ Soft Delete Moderation Record */
export const softDeleteModeration = async (req, res) => {
  try {
    const { moderationId } = req.params;

    // Soft Delete (Mark as inactive instead of removing)
    const moderationEntry = await Moderation.findById(moderationId);
    if (!moderationEntry) {
      return res.status(404).json({ message: "Moderation record not found." });
    }

    moderationEntry.deletedAt = new Date();
    await moderationEntry.save();

    res.status(200).json({ message: "Moderation record soft-deleted successfully." });
  } catch (error) {
    console.error("Delete Moderation Error:", error.message);
    res.status(500).json({ message: error.message || "Server error" });
  }
};