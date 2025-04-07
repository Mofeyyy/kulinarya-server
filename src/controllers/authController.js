import expressAsyncHandler from "express-async-handler";

// Imported Models
import User from "../models/userModel.js";

// Imported Functions
import sendVerificationEmail from "../mail/sendVerificationEmail.js";
import sendPasswordResetEmail from "../mail/sendPasswordResetEmail.js";

// ---------------------------------------------------------------------------

export const userRegistration = expressAsyncHandler(async (req, res) => {
  const user = await User.signup(req.body);

  await sendVerificationEmail(user);

  // Generate auth token and store in cookie
  user.generateAuthToken(res);

  res.status(201).json({
    success: true,
    statusCode: 201,
    message: "Registration successful! Please verify your email.",
  });
});

export const emailVerification = expressAsyncHandler(async (req, res) => {
  // Get token from the url
  const { token } = req.query;

  // Verify Email
  await User.verifyEmail(token);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Email verified successfully!",
  });
});

export const resendVerificationEmail = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.resendVerificationEmail(email);

  await sendVerificationEmail(user);

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Verification email resent successfully!",
  });
});

export const userLogin = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.login(email, password);

  // Generate auth token and store in cookie
  user.generateAuthToken(res);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Login Success",
    data: {
      user: {
        _id: user._id,
        email: user.email,
        isEmailVerified: user.isEmailVerified, // ✅ This is correct
      },
    },
  });
});

export const userLogout = expressAsyncHandler(async (_, res) => {
  res.clearCookie("kulinarya_auth_token");

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Logged out successfully",
  });
});

export const getAuthUserDetails = expressAsyncHandler(async (req, res) => {
  const result = await User.getAuthUserDetails(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "User auth details fetched successfully",
    user: result.user,
    canPostRecipe: result.canPostRecipe,
  });
});

export const forgotPassword = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;

  const { user, sendAttempts } = await User.sendPasswordResetEmail(email);

  // Send Password Reset Email
  await sendPasswordResetEmail(user);

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: `Password reset ${
      sendAttempts > 1 ? "resent" : "sent"
    } successfully!`,
  });
});


export const resetPassword = expressAsyncHandler(async (req, res) => {
  const { token } = req.query;
  const { newPassword } = req.body;

  await User.passwordReset(token, newPassword);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Password has been reset successfully",
  });
});

export const verifyResetToken = expressAsyncHandler(async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = await User.verifyResetToken(token);
    res.status(200).json({ success: true, message: 'Valid token' });
  } catch (err) {
    console.error(err.message);  // This should give more context
    res.status(400).json({ success: false, message: err.message || "Something went wrong" });
  }
});

