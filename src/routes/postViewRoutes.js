import express from "express";

// Imported Controllers
import {
  trackPostView,
  getPostViews,
} from "../controllers/postViewController.js";

const router = express.Router();

router.post("/", trackPostView); // Track Recipe Views by Users & Guests
router.get("/:recipeId", getPostViews); // Get Views for a Specific Recipe

module.exports = router;
