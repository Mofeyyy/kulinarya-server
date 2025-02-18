import { Schema, model } from "mongoose";
import mongoose from "mongoose";

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
      type: [String],
      required: true,
    },

    procedure: {
      type: [
        {
          stepNumber: { type: Number, required: true },
          content: { type: String, required: true },
        },
      ],
      validate: [(arr) => arr.length > 0, "Procedure must have at least one step."],
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
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

// 🔹 Static Methods for Reusability

// Utility to extract query parameters
RecipeSchema.statics.extractQueryParams = function (query, defaultFilter = {}) {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const sortOrder = query.sortOrder === "asc" ? { createdAt: 1 } : { createdAt: -1 };
  const filter = { ...defaultFilter };

  if (query.title) filter.title = { $regex: query.title, $options: "i" };
  if (query.category) filter.foodCategory = { $regex: new RegExp(query.category, "i") };
  if (query.origin) filter.originProvince = { $regex: new RegExp(query.origin, "i") };

  filter.$or = [{ deletedAt: null }, { deletedAt: { $exists: false } }];

  return { page, limit, filter, sortOrder };
};

// Create Recipe
RecipeSchema.statics.createRecipe = async function (data) {
  return await this.create(data);
};

// Find and update Recipe
RecipeSchema.statics.updateRecipeById = async function (recipeId, updates, userId) {
  const recipe = await this.findById(recipeId).select("byUser");
  if (!recipe) throw new Error("Recipe not found");
  if (recipe.byUser.toString() !== userId) throw new Error("Unauthorized");

  return await this.findByIdAndUpdate(recipeId, updates, { new: true, runValidators: true });
};

// Soft Delete Recipe
RecipeSchema.statics.softDeleteRecipeById = async function (recipeId, userId) {
  const recipe = await this.findById(recipeId);
  if (!recipe) throw new Error("Recipe not found");
  if (recipe.byUser.toString() !== userId) throw new Error("Unauthorized");

  recipe.deletedAt = new Date();
  return await recipe.save();
};

// Get Approved Recipes
RecipeSchema.statics.getApprovedRecipes = async function (query) {
  const { page, limit, filter, sortOrder } = this.extractQueryParams(query, { status: "approved" });

  const recipes = await this.find(filter)
    .populate("byUser", "name")
    .sort(sortOrder)
    .skip((page - 1) * limit)
    .limit(limit);

  const totalRecipes = await this.countDocuments(filter);
  return { recipes, totalRecipes, page, limit };
};

// Get Pending Recipes
RecipeSchema.statics.getPendingRecipes = async function (query) {
  const { page, limit, filter, sortOrder } = this.extractQueryParams(query, { status: "pending" });

  const recipes = await this.find(filter)
    .populate("byUser", "name")
    .sort(sortOrder)
    .skip((page - 1) * limit)
    .limit(limit);

  const totalRecipes = await this.countDocuments(filter);
  return { recipes, totalRecipes, page, limit };
};

// Get Recipe by ID
RecipeSchema.statics.getRecipeById = async function (recipeId) {
  return await this.findById(recipeId).populate("byUser", "name");
};

// Feature Recipe
RecipeSchema.statics.featureRecipeById = async function (recipeId) {
  const recipe = await this.findById(recipeId);
  if (!recipe) throw new Error("Recipe not found");
  if (recipe.status !== "approved") throw new Error("Only approved recipes can be featured");

  recipe.isFeatured = true;
  return await recipe.save();
};

// Get Featured Recipes
RecipeSchema.statics.getFeaturedRecipes = async function (query) {
  const { page, limit, filter, sortOrder } = this.extractQueryParams(query, { isFeatured: true });

  const recipes = await this.find(filter)
    .populate("byUser", "name")
    .sort(sortOrder)
    .skip((page - 1) * limit)
    .limit(limit);

  const totalRecipes = await this.countDocuments(filter);
  return { recipes, totalRecipes, page, limit };
};

const Recipe = model("Recipe", RecipeSchema);
export default Recipe;
