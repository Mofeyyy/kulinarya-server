import express from "express";

// Imported Controllers
import {
  createAnnouncement,
  getAllActiveAnnouncements,
  updateAnnouncement,
  softDeleteAnnouncement,
  getAnnouncements,
} from "../controllers/announcementController.js";

// Imported Middleware
import authenticateUser from "../middleware/authenticateUser.js";
import checkRole from "../middleware/checkRole.js";

const router = express.Router();

// Allowed roles: Only "admin" and "creator" can manage announcements
const allowedRoles = ["admin", "creator"];

// Routes
router.post("/create", authenticateUser, checkRole(allowedRoles), createAnnouncement); // Add Announcement
router.patch("/:announcementId", authenticateUser, checkRole(allowedRoles), updateAnnouncement); // Update Announcement
router.delete("/:announcementId/soft-delete", authenticateUser, checkRole(allowedRoles), softDeleteAnnouncement); // Soft Delete Announcement
router.get("/", authenticateUser, checkRole(allowedRoles), getAnnouncements);
router.get("/activeAnnouncements", getAllActiveAnnouncements); // Fetch All Active Announcements (Public)

export default router;
