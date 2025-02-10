const express = require("express");
const router = express.Router();
const {
  moderatePost,
  getModerationHistory,
  updateModeration,
  softDeleteModeration,
} = require("../controllers/moderationController");

// Moderation Management
router.post("/", moderatePost); // Approve/Reject Recipes
router.put("/:moderationId", updateModeration); // Update Moderation Decision
router.delete("/:id/soft-delete", softDeleteModeration); // Delete Moderation Record

module.exports = router;
