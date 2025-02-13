const jwt = require("jsonwebtoken");

// Verify JWT Tokens
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.SECRET);
  } catch (err) {
    throw new Error("Unauthorized - Invalid or expired token");
  }
};

module.exports = {
  verifyToken,
};
