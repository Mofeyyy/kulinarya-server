import express from "express";
import authenticateUser from "../middleware/authenticateUser.js";
import {
  getUserNotifications,
  readSpecificNotification,
  readAllNotifications,
  softDeleteNotification,
  getUnreadNotificationsCount,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", authenticateUser, getUserNotifications);
router.get("/unread-count", authenticateUser, getUnreadNotificationsCount);
router.patch(
  "/:notificationId/read",
  authenticateUser,
  readSpecificNotification
);
router.patch("/read-all", authenticateUser, readAllNotifications);
router.delete(
  "/:notificationId/soft-delete",
  authenticateUser,
  softDeleteNotification
);

export default router;
