const express = require("express");
const router = express.Router();
const {
  moderatePost,
  updateModeration,
  softDeleteModeration,
} = require("../controllers/moderationController");

// Moderation Management
router.patch("/:recipeId/moderate", moderatePost); // ✅ Approve/Reject Recipes
router.patch("/:recipeId/moderation", updateModeration); // ✅ Update Moderation Decision
router.delete("/:moderationId/soft-delete", softDeleteModeration); // ✅ Delete Moderation Record

module.exports = router;
