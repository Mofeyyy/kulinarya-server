import expressAsyncHandler from "express-async-handler";
import CustomError from "../utils/customError.js";

const checkRole = (allowedRoles) =>
  expressAsyncHandler(async (req, _, next) => {
    if (!req.user || !req.user.role) throw new CustomError("Unauthorized", 401);

    if (!allowedRoles.includes(req.user.role))
      throw new CustomError("Unauthorized, Access restricted", 403);

    next();
  });

export default checkRole;
