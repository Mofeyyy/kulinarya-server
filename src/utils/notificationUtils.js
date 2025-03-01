// Imported Validation Schema
import { updateNotificationSchema } from "../validations/notificationValidation";

export const generateNotificationContent = (
  type,
  { userInteractedFirstName, recipeTitle, isSoftDeleted, additionalData }
) => {
  if (isSoftDeleted) return; // No content if soft delete

  switch (type) {
    case "moderation": {
      const { moderationStatus, moderationNotes } = additionalData;
      const reasonText = moderationNotes ? ` Reason: ${moderationNotes}` : "";

      return moderationStatus === "approved"
        ? `${userInteractedFirstName} approved your recipe: ${recipeTitle}.`
        : `${userInteractedFirstName} rejected your recipe: ${recipeTitle}.${reasonText}`;
    }

    case "reaction": {
      const { oldReaction, newReaction } = additionalData;

      return oldReaction
        ? `${userInteractedFirstName} changed their reaction from (${oldReaction}) to (${newReaction}) on your recipe: ${recipeTitle}.`
        : `${userInteractedFirstName} reacted (${newReaction}) on your recipe: ${recipeTitle}.`;
    }

    case "comment": {
      const { oldComment } = additionalData;

      return oldComment
        ? `${userInteractedFirstName} changed their comment on your recipe: ${recipeTitle}.`
        : `${userInteractedFirstName} commented on your recipe: ${recipeTitle}.`;
    }

    default:
      throw new CustomError("Invalid notification type", 400);
  }
};

export const updateExistingNotification = async (
  notification,
  { content, isSoftDeleted }
) => {
  if (isSoftDeleted) {
    // Soft delete notification
    notification.deletedAt = new Date();
  } else {
    // Restore or update notification
    notification.deletedAt = null;
    notification.content = content;
    notification.isRead = false;
  }

  updateNotificationSchema.parse({
    deletedAt: notification.deletedAt,
    content: notification.content,
    isRead: notification.isRead,
  });

  return await notification.save();
};
