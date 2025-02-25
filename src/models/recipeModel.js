import { Schema, model } from "mongoose";
import mongoose from "mongoose";

// Imported Models
import Moderation from "./moderationModel.js";

// Imported Validations
import {
  createRecipeSchema,
  updateRecipeSchema,
} from "../validations/recipeValidations.js";

// Imported Utilities
import CustomError from "../utils/customError.js";
import { validateObjectId } from "../utils/validators.js";

// Imported Aggregation Pipelines
import { recipeAggregationPipeline } from "../utils/aggregationPipelines.js";

const RecipeSchema = new Schema(
  {
    byUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    foodCategory: {
      type: String,
      enum: ["dishes", "soup", "drinks", "desserts", "pastries"],
      required: true,
    },

    originProvince: {
      type: String,
      required: true,
    },

    pictureUrl: {
      type: String,
      default: "",
    },

    videoUrl: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    ingredients: {
      type: [
        {
          quantity: { type: Number },
          unit: { type: String },
          name: { type: String, required: true },
          notes: { type: String },
        },
      ],
      required: true,
    },

    procedure: {
      type: [
        {
          stepNumber: { type: Number, required: true },
          content: { type: String, required: true },
        },
      ],
      required: true,
    },

    moderationInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Moderation",
      default: null,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Extract Query Params
RecipeSchema.statics.extractQueryParams = function (query) {
  // Ensure that the page number is not less than 1 and the content limit is not less than 1 and greater than 100
  const page = Number.isNaN(Number(query.page))
    ? 1
    : Math.max(1, Number(query.page));

  const limit = Number.isNaN(Number(query.limit))
    ? 10
    : Math.min(Math.max(1, Number(query.limit)), 100);

  // Sort Order
  const sortOrder =
    query.sortOrder === "newest" ? { createdAt: -1 } : { createdAt: 1 };

  // Filter Values
  const filter = {};

  // Search Filter
  const searchConditions = [];
  if (query.search?.trim()) {
    const safeSearch = query.search
      .trim()
      .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"); // Escape special characters

    searchConditions.push(
      { title: { $regex: new RegExp(safeSearch, "i") } },
      { description: { $regex: new RegExp(safeSearch, "i") } }
    );
  }

  // Category & Origin Filters
  if (query.category?.trim())
    filter.foodCategory = { $regex: new RegExp(query.category.trim(), "i") };

  if (query.origin?.trim())
    filter.origin = { $regex: new RegExp(query.origin.trim(), "i") };

  // Exclude Deleted Recipes
  searchConditions.push({ deletedAt: null }, { deletedAt: { $exists: false } });

  // Merge Search & Exclude Deleted Filters
  if (searchConditions.length) filter.$or = searchConditions;

  return { page, limit, sortOrder, filter };
};

// Create Recipe
RecipeSchema.statics.createRecipe = async function (recipeData) {
  createRecipeSchema.parse(recipeData);

  const newRecipe = await this.create(recipeData);

  const newModeration = await Moderation.createModeration(
    newRecipe._id.toString()
  );

  newRecipe.moderationInfo = newModeration._id;

  return await newRecipe.save();
};

//  Find and update Recipe
RecipeSchema.statics.updateRecipe = async function (recipeId, updates, userId) {
  updateRecipeSchema.parse(updates);
  validateObjectId(recipeId, "Recipe");

  const updatedRecipe = await this.findOneAndUpdate(
    {
      _id: recipeId,
      byUser: userId,
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
    },
    updates,
    { new: true, runValidators: true }
  );

  if (!updatedRecipe) {
    const existingRecipe = await this.findOne({ _id: recipeId })
      .select("deletedAt")
      .lean();

    if (!existingRecipe) throw new CustomError("Recipe Not Found!", 404);

    if (existingRecipe.deletedAt)
      throw new CustomError("Recipe has been deleted", 403);

    throw new CustomError("Unauthorized", 401);
  }

  return updatedRecipe;
};

// Soft Delete Recipe
RecipeSchema.statics.softDeleteRecipe = async function (recipeId, userId) {
  validateObjectId(recipeId, "Recipe");

  const recipe = await this.findOne({ _id: recipeId });

  if (!recipe) throw new CustomError("Recipe Not Found!", 404);

  if (recipe.byUser.toString() !== userId)
    throw new CustomError("Unauthorized", 401);

  if (recipe.deletedAt) throw new CustomError("Recipe already deleted", 400);

  recipe.deletedAt = new Date();

  return await recipe.save();
};

// Get Approved Recipes
RecipeSchema.statics.getApprovedRecipes = async function (query) {
  const { page, limit, filter, sortOrder } = this.extractQueryParams(query);

  // Count approved recipes
  const approvedRecipeCount = await this.aggregate([
    ...recipeAggregationPipeline(filter, {
      "moderationInfo.status": "approved",
    }),

    { $count: "total" },
  ]);

  const totalApprovedRecipes = approvedRecipeCount[0]?.total || 0;

  // Fetch recipes data
  const approvedRecipesData = await this.aggregate([
    ...recipeAggregationPipeline(filter, {
      "moderationInfo.status": "approved",
    }),

    { $sort: { ...sortOrder } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ]);

  return { approvedRecipesData, totalApprovedRecipes, page, limit };
};

// Get Pending Recipes - For Moderating in Admin Panel
RecipeSchema.statics.getPendingRecipes = async function (query) {
  const { page, limit, filter, sortOrder } = this.extractQueryParams(query);

  // Count pending recipes
  const pendingRecipeCount = await this.aggregate([
    ...recipeAggregationPipeline(filter, {
      "moderationInfo.status": "pending",
    }),

    { $count: "total" },
  ]);

  const totalPendingRecipes = pendingRecipeCount[0]?.total || 0;

  // Fetch recipes data
  const pendingRecipesData = await this.aggregate([
    ...recipeAggregationPipeline(filter, {
      "moderationInfo.status": "pending",
    }),

    { $sort: { ...sortOrder } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ]);

  return { pendingRecipesData, totalPendingRecipes, page, limit };
};

// Get Recipe by ID - For Viewing in Recipe Viewing Page
RecipeSchema.statics.getRecipeById = async function (recipeId) {
  validateObjectId(recipeId, "Recipe");

  const recipe = await this.findOne({ _id: recipeId })
    .populate("byUser", "firstName middleName lastName")
    .lean();

  if (!recipe) throw new CustomError("Recipe not found", 404);

  if (recipe.deletedAt)
    throw new CustomError("Recipe has already been deleted", 404);

  return recipe;
};

// Feature Recipe
// ? How about unfeaturing a recipe, address this soon when implemented on front end
// ? Can I do this as a toggle instead soon
RecipeSchema.statics.featureRecipe = async function (recipeId) {
  validateObjectId(recipeId, "Recipe");

  const recipe = await this.findOne({ _id: recipeId }).populate(
    "moderationInfo",
    "status"
  );

  if (!recipe) throw new CustomError("Recipe not found", 404);

  if (recipe.moderationInfo.status !== "approved")
    throw new CustomError("Only approved recipes can be featured", 400);

  if (recipe.isFeatured)
    throw new CustomError("Recipe is already featured", 400);

  recipe.isFeatured = true;

  return await recipe.save();
};

// Get Featured Recipes
RecipeSchema.statics.getFeaturedRecipes = async function (query) {
  const { page, limit, filter, sortOrder } = this.extractQueryParams(query);

  // Count featured recipes
  const featuredRecipeCount = this.aggregate([
    ...recipeAggregationPipeline(filter, {
      "moderationInfo.status": "approved",
      isFeatured: true,
    }),

    { $count: "total" },
  ]);

  const totalFeaturedRecipes = featuredRecipeCount[0]?.total || 0;

  const featuredRecipesData = await this.aggregate([
    ...recipeAggregationPipeline(filter, {
      "moderationInfo.status": "approved",
      isFeatured: true,
    }),

    { $sort: { ...sortOrder } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ]);

  return { featuredRecipesData, totalFeaturedRecipes, page, limit };
};

const Recipe = model("Recipe", RecipeSchema);
export default Recipe;
