const express = require("express");
const router = express.Router();
const {
  userRegistration,
  emailVerification,
  resendVerificationEmail,
  userLogin,
  userLogout,
  getUserDetails,
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
router.get("/user-details", getUserDetails);

// Password Recovery
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
