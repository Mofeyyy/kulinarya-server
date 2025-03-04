import { z } from "zod";

const recipeBaseSchema = z.object({
  byUser: z.string().min(1, "User ID is required"),

  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .trim()
    .transform((val) => val.replace(/\b\w/g, (char) => char.toUpperCase())),

  foodCategory: z.enum(["dishes", "soup", "drinks", "desserts", "pastries"], {
    errorMap: () => ({
      error:
        "Invalid food category. Must be 'dishes', 'soup', 'drinks', 'desserts', or 'pastries'.",
    }),
  }),

  originProvince: z.string().min(1, "Origin province is required"),

  mainPictureUrl: z
    .string()
    .trim()
    .url("Invalid URL format")
    .startsWith("https://", "Picture URL must start with 'https://'")
    .optional(),

  additionalPicturesUrls: z
    .array(
      z
        .string()
        .trim()
        .url("Invalid URL format")
        .startsWith("https://", "Picture URL must start with 'https://'")
    )
    .optional(),

  videoUrl: z
    .string()
    .trim()
    .url("Invalid URL format")
    .startsWith("https://", "Video URL must start with 'https://'")
    .optional(),

  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .trim()
    .optional(),

  // TODO: Add Formating Ingredients Names
  ingredients: z
    .array(
      z.object({
        quantity: z.number().optional(),
        unit: z
          .enum(["g", "kg", "ml", "l", "cup", "tbsp", "tsp", "pcs"])
          .optional(),
        name: z.string().min(1, "Ingredient name is required"),
        notes: z.string().optional(),
      })
    )
    .min(1, "Ingredients are required")
    .max(50, "Maximum 50 ingredients allowed"),

  procedure: z
    .array(
      z.object({
        stepNumber: z.number().int().min(1),
        content: z
          .string()
          .min(1, "Step content is required")
          .max(500, "Step content must not exceed 500 characters")
          .trim(),
      })
    )
    .min(1, "Procedures are required")
    .max(30, "Maximum 30 steps allowed")
    .optional(),

  moderationInfo: z.string().min(1, "Moderation info is required").optional(),

  isFeatured: z.boolean().optional(),
  deletedAt: z.date().nullable().optional(),
});

// Create Recipe
export const createRecipeSchema = recipeBaseSchema.pick({
  byUser: true,
  title: true,
  foodCategory: true,
  originProvince: true,
  mainPictureUrl: true,
  additionalPicturesUrls: true,
  videoUrl: true,
  description: true,
  ingredients: true,
  procedure: true,
  isFeatured: true,
});

// Update Recipe
export const updateRecipeSchema = recipeBaseSchema
  .pick({
    title: true,
    foodCategory: true,
    originProvince: true,
    mainPictureUrl: true,
    additionalPicturesUrls: true,
    videoUrl: true,
    description: true,
    ingredients: true,
    procedure: true,
    moderationInfo: true,
    isFeatured: true,
    deletedAt: true,
  })
  .partial();
