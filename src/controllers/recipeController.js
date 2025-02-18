import Recipe from "../models/recipeModel.js";
import Moderation from "../models/moderationModel.js";


// ✅ Create a new recipe
export const postNewRecipe = async (req, res) => {
  try {
    const recipeData = { ...req.body, byUser: req.user.id };
    const newRecipe = await Recipe.createRecipe(recipeData);

    const newModeration = await Moderation.create({
      forPost: newRecipe._id,
      title: newRecipe.title,
      moderatedBy: req.user.id,
      status: "pending",
      notes: "Awaiting review",
    });

    newRecipe.moderationInfo = newModeration._id;
    await newRecipe.save();

    res.status(201).json({ message: "Recipe submitted for moderation.", recipe: newRecipe });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update a recipe
export const updateRecipe = async (req, res) => {
  try {
    const updatedRecipe = await Recipe.updateRecipeById(req.params.recipeId, req.body, req.user.id);
    res.status(200).json({ message: "Recipe updated successfully", recipe: updatedRecipe });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const softDeleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.softDeleteRecipeById(req.params.recipeId, req.user.id);
    res.status(200).json({ message: "Recipe successfully soft deleted", recipe });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllApprovedRecipes = async (req, res) => {
  try {
    const result = await Recipe.getApprovedRecipes(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.getRecipeById(req.params.recipeId);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.status(200).json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFeaturedRecipes = async (req, res) => {
  try {
    const result = await Recipe.getFeaturedRecipes(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const featureRecipe = async (req, res) => {
  try {
    const featuredRecipe = await Recipe.featureRecipeById(req.params.recipeId);
    res.status(200).json({ message: "Recipe successfully featured.", recipe: featuredRecipe });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingRecipes = async (req, res) => {
  try {
    const result = await Recipe.getPendingRecipes(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const extractQueryParams = (query, defaultFilter = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const sortOrder = query.sortOrder === "asc" ? { createdAt: 1 } : { createdAt: -1 };

  // ✅ Start with default filter instead of forcing "approved"
  const filter = { ...defaultFilter };

  if (query.title) filter.title = { $regex: query.title, $options: "i" }; // Case-insensitive title search
  if (query.category) {
    filter["foodCategory"] = { $regex: new RegExp(query.category, "i") }; // Adjust field name
  }
  if (query.origin) {
    filter["originProvince"] = { $regex: new RegExp(query.origin, "i") }; // Adjust field name
  }

  // ✅ Ensure only non-deleted recipes are fetched
  filter.$or = [{ deletedAt: null }, { deletedAt: { $exists: false } }];

  return { page, limit, filter, sortOrder };
};




