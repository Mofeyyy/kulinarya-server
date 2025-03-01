// Imported Validation Schema
import { updateNotificationSchema } from "../validations/notificationValidation";

export const generateNotificationContent = (
  type,
  { userInteractedFirstName, recipeTitle, additionalData }
) => {
  switch (type) {
    case "moderation":
      return `Your recipe: ${recipeTitle} has been moderated.`;

    case "reaction":
      const { oldReaction, newReaction } = additionalData;
      return oldReaction
        ? `${userInteractedFirstName} changed their reaction from (${oldReaction}) to (${newReaction}) on your recipe: ${recipeTitle}.`
        : `${userInteractedFirstName} reacted (${newReaction}) on your recipe: ${recipeTitle}.`;

    case "comment":
      return `${userInteractedFirstName} commented on your recipe: ${recipeTitle}.`;

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

  updateNotificationSchema.parse(notification);

  return await notification.save();
};
