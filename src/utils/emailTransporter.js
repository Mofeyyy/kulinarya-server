import "dotenv/config";
import { createTransport } from "nodemailer";

const transporter = createTransport({
  host: "smtp.gmail.com",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export default transporter;
