import express from "express";

// Imported Controllers
import { moderatePost } from "../controllers/moderationController.js";

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

export default router;
