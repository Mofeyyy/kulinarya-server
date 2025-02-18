import Recipe from "../models/recipeModel.js";
import Moderation from "../models/moderationModel.js";
import Notification from "../models/notificationModel.js";
import mongoose from "mongoose";


/** ✅ Approve/Reject Recipe */
export const moderatePost = async (req, res) => {
  try {
    const userId = Moderation.checkUserAuthorization(req);  // Authorization check (refactored to static)
    
    // Extract parameters (refactored to static)
    const { recipeId, status, notes } = Moderation.extractParams(req);

    Moderation.validateStatus(status); // Validate status (refactored to static)

    // Fetch Recipe & Moderation Entry (refactored to static)
    const recipe = await Moderation.findRecipeById(recipeId);
    const moderationEntry = await Moderation.findModerationEntry(recipeId);

    // Update Moderation Entry using the static method
    await Moderation.updateModerationEntry(moderationEntry, status, notes, userId);

    // Send Notification if Approved
    if (status === "approved") {
      await Moderation.createNotification(recipe.byUser, `Your recipe "${recipe.title}" has been approved! 🎉`);
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
    const userId = Moderation.checkUserAuthorization(req);  // Authorization check (refactored to static)

    // Extract parameters (refactored to static)
    const { recipeId, status, notes } = Moderation.extractParams(req);

    // Fetch Moderation Entry (refactored to static)
    const moderationEntry = await Moderation.findModerationEntry(recipeId);

    // Update Moderation Entry using the static method
    await Moderation.updateModerationEntry(moderationEntry, status, notes, userId);

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

    // Soft Delete (refactored to static method)
    await Moderation.softDeleteModerationEntry(moderationId);

    res.status(200).json({ message: "Moderation record soft-deleted successfully." });
  } catch (error) {
    console.error("Delete Moderation Error:", error.message);
    res.status(500).json({ message: error.message || "Server error" });
  }
};
