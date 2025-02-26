import mongoose from "mongoose";
import CustomError from "./customError.js";

export const validateObjectId = (id, type) => {
  if (!mongoose.isValidObjectId(id))
    throw new CustomError(`Invalid ${type} ID`, 400);
};
