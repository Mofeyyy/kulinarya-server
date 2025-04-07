import { Schema, model } from "mongoose";
import mongoose from "mongoose";
import User from "../models/userModel.js";

// Imported Utilities
import CustomError from "../utils/customError.js";
import { isUserOwnsTheRecipe } from "../utils/recipeUtils.js";
import { checkSelfInteraction } from "../utils/notificationUtils.js";
import { validateObjectId } from "../utils/validators.js";

// Imported Validations
import {
  createNotificationSchema,
  updateNotificationSchema,
} from "../validations/notificationValidation.js";

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
      default: null,
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

// Static Methods
// Cursor Based Pagination
NotificationSchema.statics.getUserNotifications = async function (req) {
  const userId = req.user.userId;
  const { limit = 10, cursor } = req.query;

  validateObjectId(userId, "User");

  const filter = {
    forUser: userId,
    deletedAt: { $in: [null, undefined] },
  };

  if (cursor) {
    filter.updatedAt = { $lt: new Date(cursor) };
  }

  // Use updatedAt consistently for sorting and cursoring
  const notifications = await this.find(filter)
    .populate("byUser", "firstName lastName profilePictureUrl")
    .sort({ updatedAt: -1 })
    .limit(Number(limit))
    .lean();

  const newCursor =
    notifications.length > 0
      ? notifications[notifications.length - 1].updatedAt
      : null;

  return { notifications, cursor: newCursor };
};

NotificationSchema.statics.getUnreadNotificationsCount = async function (req) {
  const userId = req.user.userId;

  validateObjectId(userId, "User");

  const count = await this.countDocuments({
    forUser: userId,
    isRead: false,
    deletedAt: { $in: [null, undefined] },
  });

  return count;
};

NotificationSchema.statics.readSpecificNotification = async function (req) {
  const { notificationId } = req.params;
  const userId = req.user.userId;
  console.log("notificationId:", notificationId);

  validateObjectId(notificationId, "Notification");

  const notification = await this.findById(notificationId).select(
    "isRead forUser"
  );
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

// For Creating Announcement Notification
NotificationSchema.statics.createAnnouncementNotification = async function ({
  announcementId,
  createdBy,
}) {
  // Notify all users excluding the creator and deleted users
  const usersToNotify = await User.find({
    _id: { $ne: createdBy },
    deletedAt: { $in: [null, undefined] },
  })
    .select("_id")
    .lean();

  const notifications = usersToNotify.map((user) => ({
    forUser: user._id,
    byUser: createdBy,
    fromPost: announcementId,
    type: "announcement",
    content: "A new announcement has been posted!",
  }));

  await this.insertMany(notifications);
};

// Reaction Notification Handler
NotificationSchema.statics.handleReactionNotification = async function ({
  byUser,
  fromPost,
  additionalData = {},
}) {
  // Extract Data
  const { recipeId, recipeOwnerId, recipeTitle } = fromPost;
  const { userInteractedId, userInteractedFirstName } = byUser;
  const { newReaction } = additionalData;

  console.log("Handling reaction notification for:", {
    recipeId,
    recipeOwnerId,
    userInteractedId,
  });

  validateObjectId(recipeId, "Recipe");
  validateObjectId(recipeOwnerId, "User");
  validateObjectId(userInteractedId, "User");

  // Prevent self-notifications
  if (checkSelfInteraction(userInteractedId, recipeOwnerId)) return;

  const existingNotification = await this.findOne({
    forUser: recipeOwnerId,
    byUser: userInteractedId,
    fromPost: recipeId,
    type: "reaction",
  }).lean();

  // If there is no existing notification, create a new one
  if (!existingNotification) {
    // Generate Content
    const content = `${userInteractedFirstName} reacted (${newReaction}) on your recipe: ${recipeTitle}.`;

    // Parse notification data
    const notificationData = createNotificationSchema.parse({
      forUser: recipeOwnerId,
      byUser: userInteractedId,
      fromPost: recipeId,
      type: "reaction",
      content,
    });

    console.log("Creating new reaction notification:", notificationData);
    return await this.create(notificationData);
  }
};

// Moderation Notification Handler
NotificationSchema.statics.handleModerationNotification = async function ({
  byUser,
  fromPost,
  additionalData = {},
}) {
  const { recipeId, recipeOwnerId, recipeTitle } = fromPost;
  const { userInteractedId, userInteractedFirstName } = byUser;
  const { moderationStatus, moderationNotes } = additionalData;

  console.log("Handling moderation notification for:", {
    recipeId,
    recipeOwnerId,
    userInteractedId,
  });

  validateObjectId(recipeId, "Recipe");
  validateObjectId(recipeOwnerId, "User");
  validateObjectId(userInteractedId, "User");

  // Prevent self-notifications
  if (checkSelfInteraction(userInteractedId, recipeOwnerId)) return;

  const existingNotification = await this.findOne({
    forUser: recipeOwnerId,
    fromPost: recipeId,
    type: "moderation",
  });

  // Generate content
  const content =
    moderationStatus === "approved"
      ? `${userInteractedFirstName} approved your recipe: ${recipeTitle}.`
      : `${userInteractedFirstName} rejected your recipe: ${recipeTitle}. ${
          moderationNotes ? ` Reason: ${moderationNotes}` : ""
        }`;

  if (existingNotification) {
    // If the notification already exists, update it

    existingNotification.deletedAt = null;
    existingNotification.content = content;
    existingNotification.isRead = false;

    updateNotificationSchema.parse({
      deletedAt: existingNotification.deletedAt,
      content: existingNotification.content,
      isRead: existingNotification.isRead,
    });

    const updatedNotification = await existingNotification.save();

    console.log(
      "Updating existing moderation notification:",
      updatedNotification
    );

    return updatedNotification;
  } else {
    // If there is no existing notification, create a new one

    // Parse notification data
    const notificationData = createNotificationSchema.parse({
      forUser: recipeOwnerId,
      byUser: userInteractedId,
      fromPost: recipeId,
      type: "moderation",
      content,
    });

    console.log("Creating new moderation notification:", notificationData);
    return await this.create(notificationData);
  }
};

// Comment Notification Handler
NotificationSchema.statics.handleCommentNotification = async function ({
  byUser,
  fromPost,
}) {
  const { recipeId, recipeOwnerId, recipeTitle } = fromPost;
  const { userInteractedId, userInteractedFirstName } = byUser;

  // For Debugging
  console.log("Handling comment notification for:", {
    recipeId,
    recipeOwnerId,
    userInteractedId,
  });

  validateObjectId(recipeId, "Recipe");
  validateObjectId(recipeOwnerId, "User");
  validateObjectId(userInteractedId, "User");

  // Prevent self-notifications
  if (checkSelfInteraction(userInteractedId, recipeOwnerId)) return;

  // Generate content
  const content = `${userInteractedFirstName} commented on your recipe: ${recipeTitle}.`;

  // Parse notification data
  const notificationData = createNotificationSchema.parse({
    forUser: recipeOwnerId,
    byUser: userInteractedId,
    fromPost: recipeId,
    type: "comment",
    content,
  });

  console.log("Creating new comment notification:", notificationData);
  return await this.create(notificationData);
};
const Notification = model("Notification", NotificationSchema);
export default Notification;
