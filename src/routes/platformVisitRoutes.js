const express = require("express");
const router = express.Router();
const {
  trackVisit,
  getPlatformVisits,
} = require("../controllers/platformVisitController");

router.post("/", trackVisit); // Track Guest/User Visits
router.get("/", getPlatformVisits); // Get Platform Visit Statistics (Admin Dashboard)

module.exports = router;
