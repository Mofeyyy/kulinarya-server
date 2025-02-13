const express = require("express");
const { addRecipeReaction, updateRecipeReaction, softDeleteRecipeReaction } = require("../controllers/reactionController");
const { authMiddleware } = require("../middlewares/authMiddleware"); // ✅ Middleware import

const router = express.Router();

router.post("/:recipeId", authMiddleware, addRecipeReaction);  // ✅ Authenticated
router.patch("/:reactionId", authMiddleware, updateRecipeReaction);  // ✅ Authenticated
router.delete("/:reactionId", authMiddleware, softDeleteRecipeReaction);  // ✅ Authenticated

module.exports = router;
