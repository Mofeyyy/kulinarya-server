// Imported Models
import User from "../models/userModel.js";

// Imported Functions
import sendVerificationEmail from "../mail/sendVerificationEmail.js";
import sendPasswordResetEmail from "../mail/sendPasswordResetEmail.js";

// ---------------------------------------------------------------------------

export const userRegistration = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  try {
    const user = await User.signup(email, password, firstName, lastName);

    await sendVerificationEmail(user);

    // Generate auth token and store in cookie
    user.generateAuthToken(res);

    res
      .status(201)
      .json({ message: "Registration successful! Please verify your email." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const emailVerification = async (req, res) => {
  // Get token from the url
  const { token } = req.query;

  try {
    // Verify Email
    const result = await User.verifyEmail(token);

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.resendVerificationEmail(email);

    await sendVerificationEmail(user);

    return res
      .status(200)
      .json({ message: "Verification email resent successfully!" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.login(email, password);

    // Generate auth token and store in cookie
    user.generateAuthToken(res);

    res.status(200).json({ message: "Login Success" });
  } catch (err) {
    res.status(400).json({ message: `Login Error: ${err.message}` });
  }
};

export const userLogout = async (req, res) => {
  res.clearCookie("kulinarya-auth-token");
  res.status(200).json({ message: "Logged out successfully" });
};

export const getAuthUserDetails = async (req, res) => {
  try {
    const user = await User.getAuthUserDetails(req);

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const { user, sendAttempts } = await User.sendPasswordResetEmail(email);

    // Send Password Reset Email
    await sendPasswordResetEmail(user);

    return res.status(200).json({
      message: `Password reset ${
        sendAttempts > 1 ? "resent" : "sent"
      } successfully!`,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { newPassword } = req.body;

    const result = await User.passwordReset(token, newPassword);

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
