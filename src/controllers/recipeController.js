import expressAsyncHandler from "express-async-handler";

// Imported Models
import Recipe from "../models/recipeModel.js";

export const postNewRecipe = expressAsyncHandler(async (req, res) => {
  const result = await Recipe.createRecipe(req);

  res.status(201).json({
    success: true,
    statusCode: 201,
    message: "Recipe Submitted For Moderation",
    result,
  });
});

export const updateRecipe = expressAsyncHandler(async (req, res) => {
  const result = await Recipe.updateRecipe(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Recipe successfully updated",
    result,
  });
});

export const softDeleteRecipe = expressAsyncHandler(async (req, res) => {
  const result = await Recipe.softDeleteRecipe(
    req.params.recipeId,
    req.user.userId
  );

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Recipe successfully deleted",
    result,
  });
});

export const getAllApprovedRecipes = expressAsyncHandler(async (req, res) => {
  const result = await Recipe.getApprovedRecipes(req.query);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Approved Recipes Fetched Succesfully",
    ...result,
  });
});

export const getPendingRecipes = expressAsyncHandler(async (req, res) => {
  const result = await Recipe.getPendingRecipes(req.query);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Pending Recipes Fetched Succesfully",
    ...result,
  });
});

export const getRecipeById = expressAsyncHandler(async (req, res) => {
  const recipe = await Recipe.getRecipeById(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Recipe Fetched Successfully",
    recipe,
  });
});

export const toggleFeatureRecipe = expressAsyncHandler(async (req, res) => {
  const updatedRecipe = await Recipe.toggleFeatureRecipe(req);

  res.status(200).json({
    message: updatedRecipe.isFeatured
      ? "Recipe has been featured"
      : "Recipe has been unfeatured",
    recipe: updatedRecipe,
  });
});

export const getFeaturedRecipes = expressAsyncHandler(async (req, res) => {
  const result = await Recipe.getFeaturedRecipes(req.query);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Featured Recipes Fetched Successfully",
    ...result,
  });
});

export const getTopEngagedRecipes = expressAsyncHandler(async (_, res) => {
  const topEngagedRecipes = await Recipe.getTopEngagedRecipes();

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Top Engaged Recipes Fetched Successfully",
    topEngagedRecipes,
  });
});
