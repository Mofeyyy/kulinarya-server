import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { MulterError } from "multer";

const { JsonWebTokenError, TokenExpiredError } = jwt;

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = null;

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    errors = err.errors.map((e) => ({
      path: e.path.join("."),
      message: e.message,
    }));
  }

  // Handle JWT Errors
  else if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    message = "Invalid Token";
  } else if (err instanceof TokenExpiredError) {
    statusCode = 401;
    message = "Token Expired";
  }

  // TODO: Recheck this errors later
  else if (err instanceof MulterError) {
    statusCode = 400;
    message = err.message;
  }

  // Handle Mongoose Validation Errors
  else if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
    errors = Object.values(err.errors).map((e) => e.message);
  }

  // Handle Mongoose CastError (Invalid ObjectId)
  else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid Data Type";
    errors = [{ field: err.path, message: `Invalid value: ${err.value}` }];
  }

  // Handle MongoServerError (Duplicate Key)
  else if (
    err.name === "MongoServerError" &&
    err.code === 11000 &&
    err.keyValue
  ) {
    statusCode = 400;
    message = "Duplicate Field Error";
    errors = Object.keys(err.keyValue).map((field) => ({
      field,
      message: `Duplicate value: ${err.keyValue[field]}`,
    }));
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(errors && { errors }),
  });
};

export default errorHandler;
