import { verifyToken } from "../utils/tokenUtils.js";
import CustomError from "../utils/customError.js";
import expressAsyncHandler from "express-async-handler";

export const authenticateUser = expressAsyncHandler(async (req, _, next) => {
  const token = req.cookies.kulinarya_auth_token;

  if (!token) throw new CustomError("Unauthorized - No token provided", 401);

  const decodedToken = verifyToken(token);

  req.user = decodedToken;

  next();
});

export default authenticateUser;
