const express = require("express");
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  getAllActiveAnnouncements,
  updateAnnouncement,
  softDeleteAnnouncement,
} = require("../controllers/announcementController");

// Announcement Management
router.post("/", createAnnouncement); // Add Announcement
router.patch("/:id", updateAnnouncement); // Update Announcement
router.delete("/:id/soft-delete", softDeleteAnnouncement); // Soft Delete Announcement
router.get("/", getAllActiveAnnouncements); // Fetch All Active Announcements (with optional limit query) /api/announcements?limit=<number>
router.get("/:id", getAnnouncements); // Fetch Specific Announcement

module.exports = router;
