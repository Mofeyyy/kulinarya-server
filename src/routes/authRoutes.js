const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authenticateUser");
const resendLimiter = require("../middleware/resendLimiter");
const {
  userRegistration,
  emailVerification,
  resendVerificationEmail,
  userLogin,
  userLogout,
  getAuthUserDetails,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

// User Registration
router.post("/register", userRegistration);
router.get("/verify-email", emailVerification);
router.post("/resend-verification", resendVerificationEmail);

// Login, Logout & User Details Retrieval
router.post("/login", userLogin);
router.post("/logout", userLogout);
router.get("/user-details", authenticateUser, getAuthUserDetails);

// Password Recovery
router.post("/forgot-password", resendLimiter, forgotPassword);
router.post("/reset-password", resendLimiter, resetPassword);

module.exports = router;
