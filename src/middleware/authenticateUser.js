import { verifyToken } from "../utils/tokenUtils.js";

const authenticateUser = (req, res, next) => {
  const token = req.cookies.kulinarya_auth_token; // Read token from cookies

  if (!token) throw new CustomError("Unauthorized - No token provided", 401);

  const decodedToken = verifyToken(token);
  req.user = decodedToken; // Attach user info in token to request object
  next(); // Continue to next middleware
};

export default authenticateUser;
