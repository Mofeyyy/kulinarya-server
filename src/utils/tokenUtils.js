import jwt from "jsonwebtoken";
import "dotenv/config";

// Verify JWT Tokens
export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
