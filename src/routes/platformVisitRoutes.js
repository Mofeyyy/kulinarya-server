import express from "express";

// Imported Controllers
import {
  trackVisit,
  getPlatformVisits,
} from "../controllers/platformVisitController.js";

const router = express.Router();

router.post("/", trackVisit); // Track Guest/User Visits
router.get("/", getPlatformVisits); // Get Platform Visit Statistics (Admin Dashboard)

module.exports = router;
