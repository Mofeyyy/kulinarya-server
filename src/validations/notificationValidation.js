import { z } from "zod";

export const notificationValidationSchema = z.object({
  forUser: z.string().min(1, "forUser is required"),
  byUser: z.string().min(1, "byUser is required"),
  fromPost: z.string().min(1, "fromPost is required"),
  type: z.enum(["moderation", "reaction", "comment"]),
  content: z.string().min(1, "Content is required"),
});
