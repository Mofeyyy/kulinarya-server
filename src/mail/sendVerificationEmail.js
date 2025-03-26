import transporter from "../utils/emailTransporter.js";
import "dotenv/config";

const CLIENT_URL =
  process.env.NODE_ENV === "prod"
    ? process.env.CLIENT_URL_PROD
    : process.env.CLIENT_URL_DEV;

const sendVerificationEmail = async (user) => {
  try {
    // Generate Verification Token with 1h expiry
    const token = user.generateToken("emailVerification");

    const verificationLink = `${CLIENT_URL}/verify-email?token=${token}`;

    const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verify Your Email</title>
        <style>
          body {
            font-family: "Arial", sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            padding: 30px;
            text-align: center;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          }
          .logo {
            width: 100px; 
            height: 100px; 
            border-radius: 50%; 
            object-fit: cover; 
            margin-bottom: 20px;
          }

          .header {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
          }
          .message {
            font-size: 16px;
            color: #555;
            line-height: 1.5;
            margin-bottom: 25px;
          }
          .btn {
            display: inline-block;
            padding: 14px 28px;
            background-color: #ff8c00;
            color: #ffffff !important;
            text-decoration: none;
            font-size: 16px;
            font-weight: bold;
            border-radius: 6px;
            transition: background-color 0.3s ease;
          }
          .btn:hover {
            background-color: #e67e22;
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #888;
          }
          .divider {
            height: 1px;
            background-color: #ddd;
            margin: 25px 0;
          }
          @media (max-width: 600px) {
            .container {
              padding: 20px;
            }
            .btn {
              padding: 12px 24px;
              font-size: 14px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="https://i.ibb.co/W4FKPywV/kulinarya-logo.jpg" alt="kulinarya-logo" class="logo" border="0"></img>
          <div class="header">Welcome to Kulinarya! 🍽️</div>
          <div class="message">
            You're just one step away from joining our food-loving community! 
            Click the button below to verify your email address and start exploring authentic Filipino recipes.
          </div>
          <a href="${verificationLink}" class="btn">Verify Email</a>
          <div class="divider"></div>
          <div class="footer">
            If you did not request this, please ignore this email. <br />
            This link will expire in 1 hour.
          </div>
        </div>
      </body>
    </html>`;

    // Send to User Email Address
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: "Verify Your Email - Kulinarya",
      html: emailHtml,
    });
  } catch (err) {
    throw new Error(`Error on sending email: ${err.message}`);
  }
};

export default sendVerificationEmail;
