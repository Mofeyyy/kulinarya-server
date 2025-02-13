const express = require("express");
const router = express.Router();
const { moderatePost, updateModeration, softDeleteModeration } = require("../controllers/moderationController");
const { authMiddleware, checkRole } = require("../middlewares/authMiddleware");

// Moderation Management (Only Admin & Content Creator)
router.patch("/:recipeId/moderate", authMiddleware, checkRole(["admin", "creator"]), moderatePost);
router.patch("/:recipeId/moderation", authMiddleware, checkRole(["admin", "creator"]), updateModeration);
router.delete("/:moderationId/soft-delete", authMiddleware, checkRole(["admin", "content_creator"]), softDeleteModeration);

module.exports = router;
