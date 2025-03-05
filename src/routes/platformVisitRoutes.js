import express from "express";

// Imported Controllers
import {
  trackVisit,
  getPlatformVisits,
} from "../controllers/platformVisitController.js";

import authenticateUser from "../middleware/authenticateUser.js";

const router = express.Router();

router.post("/", authenticateUser.optional, trackVisit); // Track Guest/User Visits
router.get("/", getPlatformVisits); // Get Platform Visit Statistics (Admin Dashboard)

export default router;
