const User = require("../models/userModel");
const jtw = require("jsonwebtoken");

// Ulitity Functions
const createToken = (userId) =>
  jtw.sign({ userId }, process.env.SECRET, { expiresIn: "3d" });

// Authentication Controllers
const userRegistration = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  try {
    // User Signup Static and store its data on a variable
    const newUser = await User.signup(email, password, firstName, lastName);

    // Generate a JWT Token
    const token = createToken(newUser._id);

    // Send Success Response with user email and token
    res.status(201).json({ email, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const emailVerification = async (req, res) => {
  res.status(200).json({ mssg: "Email Verification Route" });
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
  userLogin,
  userLogout,
  getUserDetails,
  forgotPassword,
  resetPassword,
};
