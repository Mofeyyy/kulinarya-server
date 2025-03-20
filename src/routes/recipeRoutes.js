import express from "express";

// Imported Controllers
import {
  postNewRecipe,
  updateRecipe,
  getAllApprovedRecipes,
  getRecipeById,
  getFeaturedRecipes,
  getPendingRecipes,
  toggleFeatureRecipe,
  softDeleteRecipe,
} from "../controllers/recipeController.js";

// Imported Middlewares
import authenticateUser from "../middleware/authenticateUser.js";
import checkRole from "../middleware/checkRole.js";
import { fileUpload } from "../middleware/multerMiddleware.js";

const router = express.Router();

// Protected Routes
router.post("/", authenticateUser, postNewRecipe);
router.patch(
  "/:recipeId",
  authenticateUser,
  fileUpload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 5 },
    { name: "video", maxCount: 1 },
  ]),
  updateRecipe
);
router.delete("/:recipeId/soft-delete", authenticateUser, softDeleteRecipe);

// Recipe Moderation (Protected - Only Admin & Content Creators)
router.get(
  "/pending",
  authenticateUser,
  checkRole(["admin", "creator"]),
  getPendingRecipes
);
router.patch(
  "/:recipeId/toggle-feature",
  authenticateUser,
  checkRole(["admin", "creator"]),
  toggleFeatureRecipe
);

// Public Routes (Viewing Recipes)
router.get("/approved", getAllApprovedRecipes);
router.get("/featured", getFeaturedRecipes);
router.get("/:recipeId", getRecipeById);

export default router;
