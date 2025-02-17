import jwt from "jsonwebtoken";

// Verify JWT Tokens
export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
