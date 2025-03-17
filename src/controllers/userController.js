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
    userRecipes
  });
});

export const getTopSharers = expressAsyncHandler(async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 4; 
  const topSharers = await User.getTopSharers(limit);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Top Sharers Fetched Successfully",
    topSharers,
  });
});



