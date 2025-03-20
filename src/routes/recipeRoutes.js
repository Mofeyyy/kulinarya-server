import express from "express";

// Imported Controllers
import {
  postNewRecipe,
  updateRecipe,
  getAllApprovedRecipes,
  getRecipeById,
  getFeaturedRecipes,
  getPendingRecipes,
  featureRecipe,
  softDeleteRecipe,
} from "../controllers/recipeController.js";

// Imported Middlewares
import authenticateUser from "../middleware/authenticateUser.js";
import checkRole from "../middleware/checkRole.js";
import { fileUpload } from "../middleware/multerMiddleware.js";

const router = express.Router();

// Protected Routes
router.post(
  "/",
  authenticateUser,
  fileUpload.fields([
    { name: "mainPicture", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "additionalPictures", maxCount: 5 },
  ]),
  postNewRecipe
);

router.patch(
  "/:recipeId",
  authenticateUser,
  fileUpload.fields([
    { name: "mainPicture", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "additionalPictures", maxCount: 5 },
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
  "/:recipeId/feature",
  authenticateUser,
  checkRole(["admin", "creator"]),
  featureRecipe
);

// Public Routes (Viewing Recipes)
router.get("/approved", getAllApprovedRecipes);
router.get("/featured", getFeaturedRecipes);
router.get("/:recipeId", getRecipeById);

export default router;
