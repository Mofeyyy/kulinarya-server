// Imported Utility Helper Functions
const transporter = require("../utils/emailTransporter");

// Imported Models
const User = require("../models/userModel");

const sendVerificationEmail = async (userEmail, userId) => {
  try {
    // Generate Verification Token with 1d expiry
    const token = User.createToken(userId, "1d");

    // Create Verification Link
    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    // Send to User Email Address
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "Verify Your Email",
      html: `<p>Click the link to verify your email: <a href="${verificationLink}">Verify Email</a></p>`,
    });
  } catch (err) {
    throw new Error("Error on sending verification email.");
  }
};

module.exports = sendVerificationEmail;
