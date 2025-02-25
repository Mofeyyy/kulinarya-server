import expressAsyncHandler from "express-async-handler";

// Imported Models
import Recipe from "../models/recipeModel.js";

export const postNewRecipe = expressAsyncHandler(async (req, res) => {
  const recipeData = { ...req.body, byUser: req.user.userId };

  const result = await Recipe.createRecipe(recipeData);

  res.status(201).json({ success: true, ...result });
});

export const updateRecipe = expressAsyncHandler(async (req, res) => {
  const result = await Recipe.updateRecipe(
    req.params.recipeId,
    req.body,
    req.user.userId
  );

  res.status(200).json({ success: true, ...result });
});

export const softDeleteRecipe = expressAsyncHandler(async (req, res) => {
  const result = await Recipe.softDeleteRecipe(
    req.params.recipeId,
    req.user.userId
  );

  res.status(200).json({ success: true, ...result });
});

export const getAllApprovedRecipes = expressAsyncHandler(async (req, res) => {
  const result = await Recipe.getApprovedRecipes(req.query);

  res.status(200).json({ success: true, ...result });
});

export const getRecipeById = expressAsyncHandler(async (req, res) => {
  const { recipeId } = req.params;

  const recipe = await Recipe.getRecipeById(recipeId);

  res.status(200).json({ success: true, recipe });
});

export const getPendingRecipes = expressAsyncHandler(async (req, res) => {
  const result = await Recipe.getPendingRecipes(req.query);

  res.status(200).json({ success: true, ...result });
});

export const featureRecipe = expressAsyncHandler(async (req, res) => {
  const { recipeId } = req.params;

  const featuredRecipe = await Recipe.featureRecipe(recipeId);

  res.status(200).json({
    success: true,
    message: "Recipe Successfully Featured.",
    recipe: featuredRecipe,
  });
});

export const getFeaturedRecipes = expressAsyncHandler(async (req, res) => {
  const result = await Recipe.getFeaturedRecipes(req.query);

  res.status(200).json({ success: true, ...result });
});
