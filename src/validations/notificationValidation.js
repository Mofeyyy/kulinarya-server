import { z } from "zod";

// -----------------------------------------------------------------------------

// Notification Base Schema
export const notificationBaseSchema = z.object({
  forUser: z.string().min(1, "forUser is required"),

  byUser: z.string().min(1, "byUser is required").optional(),

  fromPost: z.string().min(1, "fromPost is required"),

  type: z.enum(["moderation", "reaction", "comment", "announcement"]),

  content: z.string().min(1, "Content is required"),

  isRead: z.boolean().optional(),

  deletedAt: z.date().nullable().optional(),
});

// Create Notification
export const createNotificationSchema = notificationBaseSchema.pick({
  forUser: true,
  byUser: true,
  fromPost: true,
  type: true,
  content: true,
});

// Update Notification
export const updateNotificationSchema = notificationBaseSchema
  .pick({
    content: true,
    isRead: true,
    deletedAt: true,
  })
  .partial();
