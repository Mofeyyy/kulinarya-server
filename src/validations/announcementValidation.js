import { z } from "zod";

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z
    .string()
    .min(2, "Content must be at least 2 characters")
    .trim(),

  createdBy: z.string().min(1, "Created by is required"),
});
