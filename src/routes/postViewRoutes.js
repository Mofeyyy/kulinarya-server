const express = require("express");
const router = express.Router();
const { 
  trackPostView, 
  getPostViews, 
  getTopViewedPosts 
} = require("../controllers/postViewController");

// Post View Tracking
router.post("/", trackPostView); // Track Recipe Views by Users & Guests
router.get("/:recipeId", getPostViews); // Get Views for a Specific Recipe
router.get("/top", getTopViewedPosts); // Get Most Viewed Recipes (Feature for Landing Page)

module.exports = router;