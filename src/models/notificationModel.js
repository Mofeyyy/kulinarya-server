import { Schema, model } from "mongoose";
import mongoose from "mongoose";
import User from "../models/userModel.js";

// Imported Utilities
import CustomError from "../utils/customError.js";
import { isUserOwnsTheRecipe } from "../utils/recipeUtils.js";
import {
  generateNotificationContent,
  updateExistingNotification,
} from "../utils/notificationUtils.js";
import { validateObjectId } from "../utils/validators.js";

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
      enum: ["moderation", "reaction", "comment", "announcement"],
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

NotificationSchema.statics.getUserNotifications = async function (req) {
  const userId = req.user.userId;
  const { limit = 10, cursor } = req.query;
  // cursor is the last createdAt timestamp of the last fetched notification

  validateObjectId(userId, "User");

  const filter = {
    forUser: userId,
    deletedAt: { $in: [null, undefined] },
  };

  if (cursor) {
    filter.createdAt = { $lt: new Date(cursor) };
  } // If cursor of last notification fetched timestamp is provided, filter notifications created before that timestamp

  const notifications = await this.find(filter)
    .populate("byUser", "profilePictureUrl")
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .lean();

  // Set if there is still cursor to fetch more notifications
  const newCursor =
    notifications.length > 0
      ? notifications[notifications.length - 1].createdAt
      : null;

  return { notifications, cursor: newCursor };
};

NotificationSchema.statics.readSpecificNotification = async function (req) {
  const { notificationId } = req.params;
  const userId = req.user.userId;
  console.log("notificationId:", notificationId);

  validateObjectId(notificationId, "Notification");

  const notification = await this.findById(notificationId).select("isRead forUser");
  if (!notification) throw new CustomError("Notification not found", 404);

  if (notification.forUser.toString() !== userId)
    throw new CustomError("Unauthorized", 401);

  notification.isRead = true;
  await notification.save();

  return;
};


NotificationSchema.statics.markAllAsRead = async function (req) {
  const userId = req.user.userId;

  validateObjectId(userId, "User");

  await this.updateMany(
    { forUser: userId, isRead: false, deletedAt: { $in: [null, undefined] } },
    { $set: { isRead: true } }
  );
};

NotificationSchema.statics.softDeleteNotification = async function (req) {
  const { notificationId } = req.params;
  const userId = req.user.userId;

  const notification = await this.findOne({
    _id: notificationId,
    forUser: userId,
    deletedAt: { $in: [null, undefined] },
  }).select("deletedAt forUser");
  if (!notification) throw new CustomError("Notification not found", 404);

  if (notification.forUser.toString() !== userId)
    throw new CustomError("Unauthorized", 401);

  notification.deletedAt = new Date();
  await notification.save();

  return;
};

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

NotificationSchema.statics.createAnnouncementNotification = async function ({
  announcementId,
  createdBy,
}) {
  // Notify all users (excluding the creator)
  const usersToNotify = await User.find({ _id: { $ne: createdBy } }).select(
    "_id"
  );

  const notifications = usersToNotify.map((user) => ({
    forUser: user._id,
    byUser: createdBy,
    fromPost: announcementId,
    type: "announcement",
    content: "A new announcement has been posted!",
  }));

  await this.insertMany(notifications);
};

// ? ----------------------------------------------------------------
// NotificationSchema.statics.createNotification = async function (data) {
//   const validatedData = notificationValidationSchema.parse(data); // ✅ Validate before creating
//   return this.create(validatedData);
// };

const Notification = model("Notification", NotificationSchema);
export default Notification;
