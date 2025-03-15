import expressAsyncHandler from "express-async-handler";

// Imported Model
import User from "../models/userModel.js";

const initialLogin = expressAsyncHandler(async (_, res, next) => {
  const result = await User.initialLogin();

  if (result) {
    return res.status(201).json({
      success: true,
      statusCode: 201,
      ...result,
    });
  }

  next();
});

export default initialLogin;
