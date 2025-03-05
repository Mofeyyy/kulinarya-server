import { z } from "zod";

export const trackPlatformVisitSchema = z.object({
  visitType: z.enum(["guest", "user"]),
  byUser: z.string().optional().nullable(),
  byGuest: z.string().optional().nullable(),
});
