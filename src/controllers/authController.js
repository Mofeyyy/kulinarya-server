const User = require("../models/userModel");
const sendVerificationEmail = require("../mail/sendVerificationEmail");

// Imported Constants
const cookieOptions = require("../constants/cookieConfig");

const userRegistration = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  try {
    // User Signup Static and store its data on a variable
    const newUser = await User.signup(email, password, firstName, lastName);

    // Send Verification Email
    await sendVerificationEmail(newUser.email, newUser._id);

    // Send success response prompting the user to verify its email
    res
      .status(201)
      .json({ message: "Registration successful! Please verify your email." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const emailVerification = async (req, res) => {
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

const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const { userEmail, userId } = await User.resendVerificationEmail(email);

    // Send Verification Email
    await sendVerificationEmail(userEmail, userId);

    return res
      .status(200)
      .json({ message: "Verification email resent successfully!" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { message, token } = await User.login(email, password);

    // Set the token into a HTTP only cookie
    res.cookie("authToken", token, cookieOptions);

    res.status(200).json({ message });
  } catch (err) {
    res.status(400).json({ message: `Login Error: ${err.message}` });
  }
};

const userLogout = async (req, res) => {
  res.clearCookie("authToken");
  res.status(200).json({ message: "Logged out successfully" });
};

const getAuthUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "email firstName middleName lastName role"
    ); // Fetch necessary fields

    if (!user) return res.status(404).json({ message: "User not found!" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

const forgotPassword = async (req, res) => {
  res.status(200).json({ mssg: "Forgot Password Route" });
};

const resetPassword = async (req, res) => {
  res.status(200).json({ mssg: "Reset Password Route" });
};

module.exports = {
  userRegistration,
  emailVerification,
  resendVerificationEmail,
  userLogin,
  userLogout,
  getAuthUserDetails,
  forgotPassword,
  resetPassword,
};
