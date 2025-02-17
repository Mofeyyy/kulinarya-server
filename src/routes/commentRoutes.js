const express = require("express");
const { addRecipeComment, updateRecipeComment, softDeleteRecipeComment } = require("../controllers/commentController");
const verifyToken = require("../utils/tokenUtils");

const router = express.Router();

router.post("/:recipeId", verifyToken, addRecipeComment);
router.put("/:commentId", verifyToken, updateRecipeComment);
router.delete("/:commentId", verifyToken, softDeleteRecipeComment);

module.exports = router;
