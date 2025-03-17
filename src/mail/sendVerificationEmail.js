// Imported Utility Helper Functions
import transporter from "../utils/emailTransporter.js";

const sendVerificationEmail = async (user) => {
  try {
    // Generate Verification Token with 1h expiry
    const token = user.generateToken("emailVerification");

    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Email Verification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #fff5e1;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 50px auto;
            background-color: #fff;
            padding: 30px;
            text-align: center;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 20px;
          }
          .message {
            font-size: 16px;
            color: #555;
            margin-bottom: 30px;
          }
          .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: #ff8c00;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
          }
          .btn:hover {
            background-color: #e67e22;
          }
          .footer {
            margin-top: 40px;
            font-size: 12px;
            color: #888;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">Verify Your Email</div>
          <div class="message">
            Click the button below to verify your email address and complete your registration.
          </div>
          <a href="${verificationLink}" class="btn">Verify Email</a>
          <div class="footer">
            If you did not request this, please ignore this email.
          </div>
        </div>
      </body>
    </html>`;

    // Send to User Email Address
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Verify Your Email",
      html: emailHtml,
    });
  } catch (err) {
    throw new Error(`Error on sending email: ${err.message}`);
  }
};

export default sendVerificationEmail;
