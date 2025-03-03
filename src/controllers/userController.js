import expressAsyncHandler from "express-async-handler";

// Imported Models
import User from "../models/userModel.js";

export const getSpecificUserData = expressAsyncHandler(async (req, res) => {
  const userData = await User.getSpecificUserData(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "User Data Fetched Succesfully",
    userData,
  });
});

export const updateUserData = expressAsyncHandler(async (req, res) => {
  const updatedUserData = await User.updateUserData(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "User Data Fetched Succesfully",
    updatedUserData,
  });
});

export const softDeleteUserAccount = expressAsyncHandler(async (req, res) => {
  await User.softDeleteUserAccount(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "User Soft Deleted Succesfully",
  });
});

export const getUserRecipes = expressAsyncHandler(async (req, res) => {
  const userRecipes = await User.getUserRecipes(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "User Recipes Fetched Succesfully",
    userRecipes,
  });
});
