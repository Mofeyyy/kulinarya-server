import { z } from "zod";

// Comment Base Schema
const commentBaseSchema = z.object({
  fromPost: z.string().min(1, "Recipe ID is required"),

  byUser: z.string().min(1, "User ID is required"),

  content: z
    .string()
    .min(2, "Content must be at least 2 characters")
    .max(1000, "Description must not exceed 1000 characters")
    .trim(),

  deletedAt: z.date().nullable().optional(),
});

export const addCommentSchema = commentBaseSchema;

export const updateCommentSchema = commentBaseSchema
  .pick({
    content: true,
    deletedAt: true,
  })
  .partial();
