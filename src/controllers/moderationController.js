import Moderation from "../models/moderationModel.js";



/** ✅ Approve/Reject Recipe */
export const moderatePost = async (req, res) => {
  try {
    const userId = Moderation.checkUserAuthorization(req);  
    const { recipeId, status, notes } = Moderation.extractParams(req);

    Moderation.validateStatus(status); // Validate status

    // Fetch Recipe & Moderation Entry
    const recipe = await Moderation.findRecipeById(recipeId);
    const moderationEntry = await Moderation.findModerationEntry(recipeId);

    // ✅ Update Moderation Entry
    await Moderation.updateModerationEntry(moderationEntry, status, notes, userId);

    // ✅ Also update Recipe status in Recipe Collection
    recipe.status = status; // Set recipe status to "approved" or "rejected"
    await recipe.save(); // Save the updated recipe

    // ✅ Send Notification if Approved
    if (status === "approved") {
      await Moderation.createNotification(
        recipe.byUser, 
        `Your recipe "${recipe.title}" has been approved! 🎉`
      );
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
