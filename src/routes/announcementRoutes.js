import express from "express";

// Imported Controllers
import {
  createAnnouncement,
  getAllActiveAnnouncements,
  updateAnnouncement,
  softDeleteAnnouncement,
  getAnnouncements,
} from "../controllers/announcementController.js";

const router = express.Router();

router.post("/", createAnnouncement); // Add Announcement
router.patch("/:id", updateAnnouncement); // Update Announcement
router.delete("/:id/soft-delete", softDeleteAnnouncement); // Soft Delete Announcement
router.get("/", getAllActiveAnnouncements); // Fetch All Active Announcements (with optional limit query) /api/announcements?limit=<number>

export default router;
