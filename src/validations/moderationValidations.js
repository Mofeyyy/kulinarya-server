import { z } from "zod";

const moderationBaseSchema = z.object({
  forPost: z.string().min(1, "Recipe ID is required"),

  moderatedBy: z.string().min(1, "Moderator ID is required").optional(),

  status: z
    .enum(["approved", "pending", "rejected"], {
      errorMap: () => ({
        message:
          "Invalid status. Must be 'approved', 'pending', or 'rejected'.",
      }),
    })
    .optional(),

  notes: z
    .string()
    .trim()
    .max(500, "Notes must not exceed 500 characters")
    .optional(),
});

export const createModerationSchema = moderationBaseSchema.pick({
  forPost: true,
});

export const updateModerationSchema = moderationBaseSchema.partial();
