import { verifyToken } from "../utils/tokenUtils.js";
import CustomError from "../utils/customError.js";

export const authenticateUser = async (req, _, next) => {
  const token = req.cookies.kulinarya_auth_token;

  if (!token) throw new CustomError("Unauthorized - No token provided", 401);

  const decodedToken = verifyToken(token);
  
//   Add role on token generation
  req.user = {
    _id: decodedToken.userId,
    role: decodedToken.role,
  };

  next();
};

export default authenticateUser;