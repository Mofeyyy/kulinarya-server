// Imported Libraries
import express from "express";

// Imported Controllers
import {
  getSpecificUserData,
  getUserRecipes,
  updateUserData,
  softDeleteUserAccount,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/:userId", getSpecificUserData);
router.patch("/:userId/update", updateUserData);
router.delete("/:userId/soft-delete", softDeleteUserAccount);

// Fetch Recipes From a Specific User
router.get("/:userId/recipes", getUserRecipes);

export default router;
