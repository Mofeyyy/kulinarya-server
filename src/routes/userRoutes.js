const express = require("express");
const router = express.Router();
const {
  getSpecificUserData,
  updateUserData,
  softDeleteUserAccount,
  getUserRecipes,
} = require("../controllers/userController");

router.get("/:userId", getSpecificUserData);
router.patch("/:userId/update", updateUserData);
router.delete("/:userId/soft-delete", softDeleteUserAccount);

// Fetch Recipes From a Specific User
router.get("/:userId/recipes", getUserRecipes);

module.exports = router;
