// Imported Utility Helper Functions
import transporter from "../utils/emailTransporter.js";

const sendVerificationEmail = async (user) => {
  try {
    // Generate Verification Token with 1h expiry
    const token = user.generateToken("emailVerification");

    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    // Send to User Email Address
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Verify Your Email",
      html: `<p>Click the link to verify your email: <a href="${verificationLink}">Verify Email</a></p>`,
    });
  } catch (err) {
    throw new Error(`Error on sending email: ${err.message}`);
  }
};

export default sendVerificationEmail;