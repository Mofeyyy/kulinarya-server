// Imported Libraries
import express from "express";

// Imported Controllers
import {
  getSpecificUserData,
  getUserRecipes,
  updateUserData,
  softDeleteUserAccount,
} from "../controllers/userController.js";

// Imported Utilities
import authenticateUser from "../middleware/authenticateUser.js";

// ----------------------------------------------------------------

const router = express.Router();

router.get("/:userId", authenticateUser, getSpecificUserData);
router.patch("/:userId/update", authenticateUser, updateUserData);

// TODO: Add restrictions: admins, and account owners
router.delete("/:userId/soft-delete", authenticateUser, softDeleteUserAccount);

// Fetch Recipes From a Specific User
router.get("/:userId/recipes", authenticateUser, getUserRecipes);

export default router;
