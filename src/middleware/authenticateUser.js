import { verifyToken } from "../utils/tokenUtils";

const authenticateUser = (req, res, next) => {
  const token = req.cookies.authToken; // Read token from cookies

  if (!token)
    return res
      .status(401)
      .json({ message: "Unauthorized - No token provided" });

  try {
    const decodedToken = verifyToken(token);
    req.user = decodedToken; // Attach user info in token to request object
    next(); // Continue to next middleware
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

export default authenticateUser;
