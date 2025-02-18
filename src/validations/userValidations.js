import { z } from "zod";

// User Base Schema
const userBaseSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address")
    .required("Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character"
    )
    .required("Password is required"),
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .required("First name is required"),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .required("Last name is required"),
});

// User Registration
export const registerUserSchema = userBaseSchema.pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
});

// User Login
export const loginUserSchema = userBaseSchema.pick({
  email: true,
  password: true,
});

// TODO: Use this when implementing edit profile
// Edit or Update User Profile
export const updateUserSchema = userBaseSchema
  .pick({
    password: true,
    firstName: true,
    lastName: true,
  })
  .partial()
  .extend({
    isEmailVerified: z.boolean().optional(),
    role: z.enum(["admin", "creator", "user"]).optional(),
    middleName: z.string().trim().optional(),
    profilePictureUrl: z
      .string()
      .trim()
      .url("Invalid URL format")
      .startsWith("https://", "Profile picture URL must start with 'https://")
      .optional(),
    bio: z
      .string()
      .max(500, "Bio must be at most 500 characters")
      .trim()
      .refine((val) => val.length === 0 || val.trim().length > 0, {
        message: "Bio cannot be empty or just spaces",
      })
      .optional(),
    deletedAt: z.date().nullable().optional(),
  });

// TODO: Use this when implementing change email
// Change Email
export const changeEmailSchema = userBaseSchema.pick({
  email: true,
});
