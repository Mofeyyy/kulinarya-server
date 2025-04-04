import express from "express";

// Imported Controllers
import {
  moderatePost,
  fetchSpecificModeration,
  fetchPendingModerationCount,
} from "../controllers/moderationController.js";

// Imported Middlewares
import { authenticateUser } from "../middleware/authenticateUser.js";
import { checkRole } from "../middleware/checkRole.js";

// ---------------------------------------------------------------------

const router = express.Router();

router.patch(
  "/:moderationId",
  authenticateUser,
  checkRole(["admin", "creator"]),
  moderatePost
);

router.get(/pending-count/, authenticateUser, fetchPendingModerationCount);

router.get("/:recipeId", authenticateUser, fetchSpecificModeration);

export default router;
