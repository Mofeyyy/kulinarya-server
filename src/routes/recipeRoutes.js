import express from "express";

// Imported Controllers
import {
  postNewRecipe,
  updateRecipe,
  getAllApprovedRecipes,
  getApprovedRecipeById,
  getFeaturedRecipes,
  getPendingRecipes,
  toggleFeatureRecipe,
  softDeleteRecipe,
  getTopEngagedRecipes,
  getRecipeById,
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
  "/:recipeId/toggle-feature",
  authenticateUser,
  checkRole(["admin", "creator"]),
  toggleFeatureRecipe
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

// GET ROUTES
// Protected - Admin and Creator
router.get(
  "/pending",
  authenticateUser,
  checkRole(["admin", "creator"]),
  getPendingRecipes
);
// Public
router.get("/approved", getAllApprovedRecipes);
router.get("/featured", getFeaturedRecipes);
router.get("/top-engaged", getTopEngagedRecipes);
router.get(
  "/approved/:recipeId",
  authenticateUser.optional,
  getApprovedRecipeById
);
router.get("/edit/:recipeId", authenticateUser, getRecipeById);

export default router;
