import Notification from "../models/notificationModel.js";
import expressAsyncHandler from "express-async-handler";

// 📌 Get all notifications for a user (Unread & Not Deleted)
export const getUserNotifications = expressAsyncHandler(async (req, res) => {
  const { _id } = req.user; // Extract userId from middleware
  const notifications = await Notification.getUserNotifications(_id);
  res.status(200).json(notifications);
});

// 📌 Mark a specific notification as read
export const readSpecificNotification = expressAsyncHandler(async (req, res) => {
  const { notifId } = req.params;
  await Notification.markAsRead(notifId);
  res.status(200).json({ message: "Notification marked as read" });
});

// 📌 Mark all notifications as read for a user
export const readAllNotifications = expressAsyncHandler(async (req, res) => {
  const { _id } = req.user; // Extract userId from middleware
  await Notification.markAllAsRead(_id);
  res.status(200).json({ message: "All notifications marked as read" });
});

// 📌 Soft delete a notification
export const softDeleteNotification = expressAsyncHandler(async (req, res) => {
  const { notifId } = req.params;
  await Notification.softDeleteNotification(notifId);
  res.status(200).json({ message: "Notification soft deleted" });
});

// 📌 Create a new notification (Validation in Model)
export const createNotification = expressAsyncHandler(async (req, res) => {
  const notification = await Notification.createNotification(req.body);
  res.status(201).json(notification);
});
