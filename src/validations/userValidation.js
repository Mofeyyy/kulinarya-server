import { z } from "zod";

const userSchema = z
  .object({
    mode: z.enum(["register", "login", "update"]).optional(),
    email: z.string().email("Invalid email address").optional(),
    password: z.string().optional(),
    isEmailVerified: z.boolean().optional(),
    role: z.enum(["admin", "creator", "user"]).optional(),
    firstName: z
      .string()
      .min(1, "First name must be at least 1 character")
      .optional(),
    middleName: z.string().optional(),
    lastName: z
      .string()
      .min(1, "Last name must be at least 1 character")
      .optional(),
    profilePictureUrl: z.string().url("Invalid URL format").optional(),
    bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
    deletedAt: z.date().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    // Register Mode: Require: email, password, firstName and lastName
    if (data.mode === "register") {
      if (!data.email) {
        ctx.addIssue({
          path: ["email"],
          message: "Email is required",
        });
      }

      if (!data.password) {
        ctx.addIssue({
          path: ["password"],
          message: "Password is required",
        });
      }

      if (!data.firstName) {
        ctx.addIssue({
          path: ["firstName"],
          message: "First name is required",
        });
      }

      if (!data.lastName) {
        ctx.addIssue({
          path: ["lastName"],
          message: "Last name is required",
        });
      }
    }

    // Login Mode: Require: email and password
    if (data.mode === "login") {
      if (!data.email) {
        ctx.addIssue({
          path: ["email"],
          message: "Email is required",
        });
      }

      if (!data.password) {
        ctx.addIssue({
          path: ["password"],
          message: "Password is required",
        });
      }
    }

    // Skip Password Validation in Login Mode
    if (data.mode !== "login") {
      const reachMinPasswordLength = data.password?.length >= 8;
      const hasUpperCaseLetter = /[A-Z]/.test(data.password);
      const hasLowerCaseLetter = /[a-z]/.test(data.password);
      const hasNumber = /[0-9]/.test(data.password);
      const hasSpecialChar = /[^a-zA-Z0-9]/.test(data.password);

      if (!reachMinPasswordLength) {
        ctx.addIssue({
          path: ["password"],
          message: "Password must be at least 8 characters long",
        });
      } else if (!hasUpperCaseLetter) {
        ctx.addIssue({
          path: ["password"],
          message: "Password must contain at least one uppercase letter",
        });
      } else if (!hasLowerCaseLetter) {
        ctx.addIssue({
          path: ["password"],
          message: "Password must contain at least one lowercase letter",
        });
      } else if (!hasNumber) {
        ctx.addIssue({
          path: ["password"],
          message: "Password must contain at least one number",
        });
      } else if (!hasSpecialChar) {
        ctx.addIssue({
          path: ["password"],
          message: "Password must contain at least one special character",
        });
      }
    }

    // Update Mode: All Fields
  });

export default userSchema;
