import { Schema, model } from "mongoose";
import mongoose from "mongoose";

// Imported Utilities
import CustomError from "../utils/customError.js";
import { isUserOwnsTheRecipe } from "../utils/recipeUtils.js";
import {
  generateNotificationContent,
  updateExistingNotification,
} from "../utils/notificationUtils.js";

// Imported Validations
import { createNotificationSchema } from "../validations/notificationValidation.js";

// ---------------------------------------------------------------------------

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

// * -----------------------------------------------------------------------

// Centralized Notification Handler
// TODO: Test this
NotificationSchema.statics.handleNotification = async function ({
  byUser,
  fromPost,
  type,
  additionalData = {},
  isSoftDeleted = false,
}) {
  const { recipeId, recipeOwnerId, recipeTitle } = fromPost;
  const { userInteractedId, userInteractedFirstName } = byUser;

  // To prevent notifying self
  if (isUserOwnsTheRecipe(recipeOwnerId, userInteractedId)) return;

  const existingNotification = await this.findOne({
    forUser: recipeOwnerId,
    byUser: userInteractedId,
    fromPost: recipeId,
    type,
  });

  const content = generateNotificationContent(type, {
    userInteractedFirstName,
    recipeTitle,
    additionalData,
  });

  // If notification exists, update or soft delete it
  if (existingNotification) {
    return await updateExistingNotification(existingNotification, {
      content,
      isSoftDeleted,
    });
  }

  // No need to create notification if soft deleted
  if (isSoftDeleted) return;

  const notificationData = createNotificationSchema.parse({
    forUser: recipeOwnerId,
    byUser: userInteractedId,
    fromPost: recipeId,
    type,
    content,
  });

  return await this.create(notificationData);
};

const Notification = model("Notification", NotificationSchema);
export default Notification;
