// Imported Models
const User = require("../models/userModel");

// Imported Utility Helper Functions
const transporter = require("../utils/emailTransporter");

const sendPasswordResetEmail = async (userEmail, userId) => {
  try {
    // Generate Verification Token with 1d expiry
    const token = User.createToken({ userId }, "15m");

    // Create Verification Link
    const resetPasswordLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    // Send to User Email Address
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "Password Reset",
      html: `<p>Click the link to reset your password: <a href="${resetPasswordLink}">Reset Your Password</a></p>`,
    });
  } catch (err) {
    throw new Error(`Error on sending email: ${err.message}`);
  }
};

module.exports = sendPasswordResetEmail;
