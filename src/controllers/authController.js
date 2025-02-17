import expressAsyncHandler from "express-async-handler";

// Imported Models
import User from "../models/userModel.js";

// Imported Functions
import sendVerificationEmail from "../mail/sendVerificationEmail.js";
import sendPasswordResetEmail from "../mail/sendPasswordResetEmail.js";

// ---------------------------------------------------------------------------

export const userRegistration = expressAsyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  const user = await User.signup(email, password, firstName, lastName);

  await sendVerificationEmail(user);

  // Generate auth token and store in cookie
  user.generateAuthToken(res);

  res
    .status(201)
    .json({ message: "Registration successful! Please verify your email." });
});

export const emailVerification = expressAsyncHandler(async (req, res) => {
  // Get token from the url
  const { token } = req.query;

  // Verify Email
  const result = await User.verifyEmail(token);

  res.status(200).json(result);
});

export const resendVerificationEmail = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.resendVerificationEmail(email);

  await sendVerificationEmail(user);

  return res
    .status(200)
    .json({ message: "Verification email resent successfully!" });
});

export const userLogin = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.login(email, password);

  // Generate auth token and store in cookie
  user.generateAuthToken(res);

  res.status(200).json({ message: "Login Success" });
});

export const userLogout = expressAsyncHandler(async (_, res) => {
  res.clearCookie("kulinarya_auth_token");
  res.status(200).json({ message: "Logged out successfully" });
});

export const getAuthUserDetails = expressAsyncHandler(async (req, res) => {
  const user = await User.getAuthUserDetails(req);
  res.status(200).json(user);
});

export const forgotPassword = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;

  const { user, sendAttempts } = await User.sendPasswordResetEmail(email);

  // Send Password Reset Email
  await sendPasswordResetEmail(user);

  return res.status(200).json({
    message: `Password reset ${
      sendAttempts > 1 ? "resent" : "sent"
    } successfully!`,
  });
});

export const resetPassword = expressAsyncHandler(async (req, res) => {
  const { token } = req.query;
  const { newPassword } = req.body;

  const result = await User.passwordReset(token, newPassword);

  res.status(200).json(result);
});