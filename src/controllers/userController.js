import expressAsyncHandler from "express-async-handler";

// Imported Models
import User from "../models/userModel.js";

export const getSpecificUserData = expressAsyncHandler(async (req, res) => {
  const user = await User.getSpecificUserData(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "User Data Fetched Succesfully",
    user,
  });
});

export const getAllUsers = expressAsyncHandler(async (req, res) => {
  const result = await User.getAllUsers(req.query);
  res.status(200).json(result);
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
  await User.softDeleteUser(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "User Soft Deleted Succesfully",
  });
});

export const getUserRecipes = expressAsyncHandler(async (req, res) => {
  const { userRecipes, totalRecipes } = await User.getUserRecipesList(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "User Recipes Fetched Successfully",
    totalRecipes,
    userRecipes,
  });
});

export const getTopSharers = expressAsyncHandler(async (req, res) => {
  const topSharers = await User.getTopSharers();

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Top Sharers Fetched Successfully",
    topSharers,
  });
});

export const userChangePassword = expressAsyncHandler(async (req, res) => {
  await User.userChangePassword(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Password Changed Successfully",
  });
});
