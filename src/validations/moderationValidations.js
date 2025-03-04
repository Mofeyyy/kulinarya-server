import { z } from "zod";

const moderationBaseSchema = z.object({
  forPost: z.string().min(1, "Recipe ID is required"),

  moderatedBy: z.string().min(1, "Moderator ID is required").optional(),

  status: z.enum(["approved", "pending", "rejected"]).optional(),

  notes: z
    .string()
    .min(2, "Notes must be at least 2 characters")
    .max(1000, "Notes must not exceed 1000 characters")
    .trim()
    .optional(),

  deletedAt: z.date().nullable().optional(),
});

export const createModerationSchema = moderationBaseSchema;

export const updateModerationSchema = moderationBaseSchema
  .pick({ status: true, notes: true, deletedAt: true })
  .partial();
