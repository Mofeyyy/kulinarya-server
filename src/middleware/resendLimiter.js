import rateLimit from "express-rate-limit";

const resendLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Allow 3 requests per 5 minutes
  message: { message: "Too many requests. Please try again later." },
  headers: true,
});

export default resendLimiter;