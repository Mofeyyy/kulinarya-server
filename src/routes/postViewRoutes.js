const express = require("express");
const router = express.Router();
const {
  trackPostView,
  getPostViews,
} = require("../controllers/postViewController");

// Track a view for a specific recipe (User & Guest)
router.post("/:recipeId", trackPostView);

// Get total views for a specific recipe
router.get("/:recipeId", getPostViews);

module.exports = router;
