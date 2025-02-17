import { ZodError } from "zod";
import jwt from "jsonwebtoken";
const { JsonWebTokenError, TokenExpiredError } = jwt;

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    return res.status(statusCode).json({
      success: false,
      message,
      statusCode,
      errors: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // Handle JWT Errors
  if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    message = "Invalid Token";
  } else if (err instanceof TokenExpiredError) {
    statusCode = 401;
    message = "Token Expired";
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
};

export default errorHandler;
