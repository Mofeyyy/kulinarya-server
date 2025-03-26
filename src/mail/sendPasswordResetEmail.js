import transporter from "../utils/emailTransporter.js";
import "dotenv/config";

const CLIENT_URL =
  process.env.NODE_ENV === "prod"
    ? process.env.CLIENT_URL_PROD
    : process.env.CLIENT_URL_DEV;

const sendPasswordResetEmail = async (user) => {
  try {
    // Generate Password Reset Token with 15mins expiry
    const token = user.generateToken("passwordReset");

    const resetPasswordLink = `${CLIENT_URL}/reset-password?token=${token}`;

    // Send to User Email Address
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: "Password Reset",
      html: `<p>Click the link to reset your password: <a href="${resetPasswordLink}">Reset Your Password</a></p>`,
    });
  } catch (err) {
    throw new Error(`Error on sending email: ${err.message}`);
  }
};

export default sendPasswordResetEmail;
