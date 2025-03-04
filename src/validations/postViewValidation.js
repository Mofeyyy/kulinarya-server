import { z } from "zod";

export const trackPostViewSchema = z.object({
  fromPost: z.string().min(1, "Recipe ID is required"),
  viewType: z.enum(["guest", "user"]),
  byUser: z.string().optional().nullable(),
  byGuest: z.string().optional().nullable(),
});
