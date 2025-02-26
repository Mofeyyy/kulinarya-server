import { z } from "zod";

export const reactionValidationSchema = z.object({
  fromPost: z.string().min(1, "Recipe post is required"),
  byUser: z.string().min(1, "User ID is required"),
  reaction: z.enum(["heart", "drool", "neutral", null]),
});
