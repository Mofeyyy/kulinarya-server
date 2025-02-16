// Imported Utility Helper Functions
import { sendMail } from "../utils/emailTransporter";

const sendPasswordResetEmail = async (user) => {
  try {
    // Generate Password Reset Token with 15mins expiry
    const token = user.generateToken("passwordReset");

    const resetPasswordLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    // Send to User Email Address
    await sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset",
      html: `<p>Click the link to reset your password: <a href="${resetPasswordLink}">Reset Your Password</a></p>`,
    });
  } catch (err) {
    throw new Error(`Error on sending email: ${err.message}`);
  }
};

export default sendPasswordResetEmail;
