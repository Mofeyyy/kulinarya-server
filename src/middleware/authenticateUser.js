import { verifyToken } from "../utils/tokenUtils.js";
import User from "../models/userModel.js";


export const authenticateUser = async (req, res, next) => {
 // const token = req.cookies.kulinarya_auth_token; // Read token from cookies
  let token = req.cookies.kulinarya_auth_token; // Read token from cookies
  
  // If token is not in cookies, check for Authorization header
  if (!token && req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];  // Extract token from "Bearer <token>"
  }

  if (!token) throw new CustomError("Unauthorized - No token provided", 401);

      const decodedToken = verifyToken(token);
      req.user = decodedToken; // Attach user info in token to request object
      const user = await User.findById(decodedToken.userId); // Ensure you have the user in the DB

    req.user = user; // Add user data to request
      next(); // Continue to next middleware
};

  export default authenticateUser;
