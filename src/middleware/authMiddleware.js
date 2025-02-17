const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from the request headers
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET);

    // Find user and attach to request
    const user = await User.findById(decoded.userId).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    req.user = { _id: user._id.toString(), role: user.role }; // Attach only necessary user info to request
    console.log("Authenticated User:", req.user); // Check if user is correctly set
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// Middleware to check user role
const checkRole = (allowedRoles) => async (req, res, next) => {
  try {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized. Access restricted to specific roles." });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error.", error });
  }
};

module.exports = { authMiddleware, checkRole };
