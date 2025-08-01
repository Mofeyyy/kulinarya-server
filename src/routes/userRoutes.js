// Imported Libraries
import express from "express";

// Imported Controllers
import {
  getSpecificUserData,
  getUserRecipes,
  updateUserData,
  softDeleteUserAccount,
  getTopSharers,
  getAllUsers,
  userChangePassword,
} from "../controllers/userController.js";

// Imported Middlewares
import authenticateUser from "../middleware/authenticateUser.js";
import { fileUpload } from "../middleware/multerMiddleware.js";

// ----------------------------------------------------------------

const router = express.Router();
// Get Top Sharers
router.get("/all", authenticateUser, getAllUsers);
router.get("/top-sharers", getTopSharers);
router.get("/:userId", authenticateUser, getSpecificUserData);
router.patch(
  "/:userId/update",
  authenticateUser,
  fileUpload.single("profilePictureUrl"),
  updateUserData
);
router.delete("/:userId/soft-delete", authenticateUser, softDeleteUserAccount);

// Fetch Recipes From a Specific User
router.get("/:userId/recipes", authenticateUser, getUserRecipes);

router.patch("/:userId/change-password", authenticateUser, userChangePassword);

export default router;
