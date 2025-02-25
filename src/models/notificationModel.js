import { Schema, model } from "mongoose";
import mongoose from "mongoose";
import CustomError from "../utils/customError.js";
import { notificationValidationSchema } from "../validations/notificationValidation.js"; // ✅ Import Zod Schema

// Notification Schema
const NotificationSchema = new Schema(
  {
    forUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    byUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fromPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },
    type: {
      type: String,
      enum: ["moderation", "reaction", "comment"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// 🔹 Static Methods for Clean Code

// Fetch user notifications (Unread & Not Deleted)
NotificationSchema.statics.getUserNotifications = async function (userId) {
  return this.find({
    forUser: userId,
    deletedAt: null,
  })
    .sort({ createdAt: -1 })
    .lean();
};

// Mark a notification as read
NotificationSchema.statics.markAsRead = async function (notifId) {
  const notification = await this.findById(notifId);
  if (!notification) throw new CustomError("Notification not found", 404);
  notification.isRead = true;
  await notification.save();
};

// Mark all notifications as read for a user
NotificationSchema.statics.markAllAsRead = async function (userId) {
  await this.updateMany(
    { forUser: userId, isRead: false, deletedAt: null },
    { $set: { isRead: true } }
  );
};

// Soft delete a notification
NotificationSchema.statics.softDeleteNotification = async function (query) {
  const notification = await this.findOne({
    fromPost: query.fromPost,
    byUser: query.byUser,
    type: "reaction",
    deletedAt: null,
  });
  if (notification) {
    notification.deletedAt = new Date();
    await notification.save();
  }
  return { message: "Notification successfully soft deleted" };
};

// Create a new notification with Zod validation
NotificationSchema.statics.createNotification = async function (data) {
  const validatedData = notificationValidationSchema.parse(data); // ✅ Validate before creating
  return this.create(validatedData);
};

const Notification = model("Notification", NotificationSchema);
export default Notification;
