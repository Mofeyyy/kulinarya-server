import express from "express";

// Imported Middlewares
import authenticateUser from "../middleware/authenticateUser.js";
import resendLimiter from "../middleware/resendLimiter.js";

// Imported Controllers
import {
  userRegistration,
  emailVerification,
  resendVerificationEmail,
  userLogin,
  userLogout,
  getAuthUserDetails,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

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

export default router;
