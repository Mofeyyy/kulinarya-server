import express from "express";
import { addRecipeComment, updateRecipeComment, softDeleteRecipeComment } from "../controllers/commentController.js";

import { authenticateUser } from "../middleware/authenticateUser.js";


const router = express.Router();

router.post("/:recipeId", authenticateUser, addRecipeComment);
router.patch("/:commentId", authenticateUser, updateRecipeComment);
router.delete("/:commentId/soft-delete", authenticateUser, softDeleteRecipeComment);

export default router;
