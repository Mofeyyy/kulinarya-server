import express from "express";

//  Imported Controllers
import {
  getUserNotifications,
  readSpecificNotification,
  readAllNotifications,
  softDeleteNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/users/:userId", getUserNotifications);
router.patch("/:notificationId/read", readSpecificNotification);
router.patch("/:notificationId/read-all", readAllNotifications);
router.delete("/:notificationId/soft-delete", softDeleteNotification);

export default router;