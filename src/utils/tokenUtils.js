import jwt from "jsonwebtoken";

// Verify JWT Tokens
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.SECRET);
  } catch (err) {
    throw new Error("Unauthorized - Invalid or expired token");
  }
};
