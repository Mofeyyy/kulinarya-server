import Recipe from "../models/recipeModel.js";
import Moderation from "../models/moderationModel.js";


// Recipe Management
export const postNewRecipe = async (req, res) => {
  try {
    console.log('Authenticated User:', req.user);  // Log req.user to ensure it's populated
    const {
      title,
      foodCategory,
      originProvince,
      pictureUrl,
      videoUrl,
      description,
      ingredients,
      procedure,
    } = req.body;
    const byUser = req.user.id;

    if (
      !title ||
      !foodCategory ||
      !originProvince ||
      !ingredients ||
      !procedure
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const newRecipe = new Recipe({
      byUser,
      title,
      foodCategory,
      originProvince,
      pictureUrl,
      videoUrl,
      description,
      ingredients,
      procedure,
    });

    await newRecipe.save();

    const newModeration = await Moderation.create({
      forPost: newRecipe._id,
      moderatedBy: byUser,
      status: "pending",
      notes: "Awaiting review",
    });

    newRecipe.moderationInfo = newModeration._id;
    await newRecipe.save();

    res
      .status(201)
      .json({ message: "Recipe submitted for moderation.", recipe: newRecipe });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const updates = req.body;
    const byUser = req.user.id;

    const recipe = await Recipe.findById(recipeId).select("byUser");
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    console.log(`Recipe Owner: ${recipe.byUser}, Request User: ${byUser}`);

    if (recipe.byUser.toString() !== byUser) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(recipeId, updates, {
      new: true,
      runValidators: true,
    });
    res
      .status(200)
      .json({ message: "Recipe updated successfully", recipe: updatedRecipe });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const softDeleteRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const byUser = req.user.id;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    if (recipe.byUser.toString() !== byUser) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    recipe.deletedAt = new Date();
    await recipe.save();

    res
      .status(200)
      .json({ message: "Recipe successfully soft deleted", recipe });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getAllApprovedRecipes = async (req, res) => {
  try {
    const { page, limit, filter, sortOrder } = extractQueryParams(req.query, {
      status: "approved",
    });

    const approvedRecipes = await Recipe.find(filter)
      .populate("byUser", "name")
      .sort(sortOrder)
      .skip((page - 1) * limit)
      .limit(limit);

    const totalRecipes = await Recipe.countDocuments(filter);

    if (approvedRecipes.length === 0) {
      return res.status(404).json({ message: "No recipes found matching the filters." });
    }

    res.status(200).json({
      success: true,
      page,
      limit,
      totalRecipes,
      totalPages: Math.ceil(totalRecipes / limit),
      recipes: approvedRecipes,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};



export const getRecipeById = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const recipe = await Recipe.findById(recipeId).populate("byUser", "name");

    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.status(200).json(recipe);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getFeaturedRecipes = async (req, res) => {
  try {
    const { page, limit, filter, sortOrder } = extractQueryParams(req.query, {
      isFeatured: true,
    });

    const featuredRecipes = await Recipe.find(filter)
      .populate("byUser", "name")
      .sort(sortOrder)
      .skip((page - 1) * limit)
      .limit(limit);

    const totalFeaturedRecipes = await Recipe.countDocuments(filter);

    res.status(200).json({
      success: true,
      page,
      limit,
      totalRecipes: totalFeaturedRecipes,
      totalPages: Math.ceil(totalFeaturedRecipes / limit),
      recipes: featuredRecipes,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};



export const featureRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    if (recipe.status !== "approved") {
      return res
        .status(400)
        .json({ message: "Only approved recipes can be featured" });
    }

    recipe.isFeatured = true;
    await recipe.save();

    res.status(200).json({ message: "Recipe successfully featured", recipe });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getPendingRecipes = async (req, res) => {
  try {
    const { page, limit, filter, sortOrder } = extractQueryParams(req.query, {
      status: "pending",
    });

    const pendingRecipes = await Recipe.find(filter)
      .populate("byUser", "name")
      .sort(sortOrder)
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPendingRecipes = await Recipe.countDocuments(filter);

    res.status(200).json({
      success: true,
      page,
      limit,
      totalRecipes: totalPendingRecipes,
      totalPages: Math.ceil(totalPendingRecipes / limit),
      recipes: pendingRecipes,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
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




