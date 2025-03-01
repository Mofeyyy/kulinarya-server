import { z } from "zod";

// ---------------------------------------------------------------------------

// Reaction Base Schema
const reactionBaseSchema = z.object({
  fromPost: z.string().min(1, "Recipe ID is required"),

  byUser: z.string().min(1, "User ID is required"),

  reaction: z.enum(["heart", "drool", "neutral"]).nullable(),

  deletedAt: z.date().nullable().optional(),
});

// Add Recipe Schema
export const addReactionSchema = reactionBaseSchema;

// Update Reaction Schema
export const updateReactionSchema = reactionBaseSchema
  .pick({
    reaction: true,
    deletedAt: true,
  })
  .partial();
