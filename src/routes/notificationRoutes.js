const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  readSpecificNotification,
  readAllNotifications,
  softDeleteNotification,
} = require("../controllers/notificationController");

router.get("/users/:userId", getUserNotifications);
router.patch("/:notificationId/read", readSpecificNotification);
router.patch("/:notificationId/read-all", readAllNotifications);
router.delete("/:notificationId/soft-delete", softDeleteNotification);

module.exports = router;
