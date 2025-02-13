const express = require("express");
const router = express.Router();
const { trackVisit, getPlatformVisits } = require("../controllers/platformVisitController");
//const requireAuth = require("../middlewares/requireAuth");
//const requireRole = require("../middlewares/requireRole");

// Track a guest/user visit
router.post("/track", trackVisit);

// Get platform visit statistics (Admin Only)
//router.get("/", requireAuth, requireRole(["admin"]), getPlatformVisits); for authentication
router.get("/", getPlatformVisits);

module.exports = router;
