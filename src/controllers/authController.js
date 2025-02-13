const User = require("../models/userModel");
const sendVerificationEmail = require("../mail/sendVerificationEmail");

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
  res.status(200).json({ mssg: "Login Route" });
};

const userLogout = async (req, res) => {
  res.status(200).json({ mssg: "Logout Route" });
};

const getUserDetails = async (req, res) => {
  res.status(200).json({ mssg: "Retrieve User Details Route" });
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
  getUserDetails,
  forgotPassword,
  resetPassword,
};
