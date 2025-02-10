const express = require("express");
const router = express.Router();
const {
  trackPostView,
  getPostViews,
} = require("../controllers/postViewController");

router.post("/", trackPostView); // Track Recipe Views by Users & Guests
router.get("/:recipeId", getPostViews); // Get Views for a Specific Recipe

module.exports = router;
