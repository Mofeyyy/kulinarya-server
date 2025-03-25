import { Schema, model } from "mongoose";
import mongoose from "mongoose";

// Imported Models
import Moderation from "./moderationModel.js";
import Reaction from "./reactionModel.js";

// Imported Validations
import {
  createRecipeSchema,
  updateRecipeSchema,
} from "../validations/recipeValidations.js";

// Imported Utilities
import CustomError from "../utils/customError.js";
import { validateObjectId } from "../utils/validators.js";
import handleSupabaseUpload from "../utils/handleSupabaseUpload.js";

// Imported Aggregation Pipelines
import {
  recipeAggregationPipeline,
  commentCountPipeline,
  commentPreviewPipeline,
  reactionCountPipeline,
} from "../utils/aggregationPipelines.js";

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

    mainPictureUrl: {
      type: String,
      default: "",
    },

    additionalPicturesUrls: {
      type: [String],
      default: [],
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

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
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
  console.log(`Query: ${JSON.stringify(query)}`);

  const page = Number.isNaN(Number(query.page))
    ? 1
    : Math.max(1, Number(query.page));
  const limit = Number.isNaN(Number(query.limit))
    ? 10
    : Math.min(Math.max(1, Number(query.limit)), 100);
  const sortOrder =
    query.sortOrder === "newest" ? { createdAt: -1 } : { createdAt: 1 };

  const filter = {};
  const searchConditions = [];

  // Search Filter
  const search = query.search?.trim();
  if (search) {
    const safeSearch = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"); // Escape special characters
    searchConditions.push(
      { title: { $regex: safeSearch, $options: "i" } },
      { description: { $regex: safeSearch, $options: "i" } }
    );
  }

  // Category & Origin Filters
  const category = query.category?.trim();
  const origin = query.origin?.trim();

  if (category) {
    filter.foodCategory = { $regex: category, $options: "i" };
  }

  if (origin) {
    filter.originProvince = { $regex: origin, $options: "i" };
  }

  // Exclude Deleted Recipes
  const deletedFilter = {
    $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
  };

  if (searchConditions.length) {
    filter.$and = [{ $or: searchConditions }, deletedFilter];
  } else {
    filter.$and = [deletedFilter];
  }

  return { page, limit, sortOrder, filter };
};

// Create Recipe
RecipeSchema.statics.createRecipe = async function (req) {
  // Parse ingredients and procedures if they are strings
  req.body.ingredients = req.body.ingredients
    ? JSON.parse(req.body.ingredients)
    : [];
  req.body.procedure = req.body.procedure ? JSON.parse(req.body.procedure) : [];

  console.log("Parsed Ingredients:", req.body.ingredients);
  console.log("Parsed Procedure:", req.body.procedure);
  console.log("Request Files:", req.files);

  const recipeMediaUrls = {};

  // Supabase File Uploads
  // Recipe Main Display Picture
  if (req.files) {
    if (req.files.mainPicture) {
      recipeMediaUrls.mainPictureUrl = await handleSupabaseUpload({
        file: req.files.mainPicture[0],
        folder: "recipe_pictures",
        allowedTypes: ["jpeg", "png"],
        maxFileSize: 10 * 1024 * 1024, // 10mb
      });
    }

    // Recipe Highlight Video
    if (req.files.highlightVideo) {
      recipeMediaUrls.videoUrl = await handleSupabaseUpload({
        file: req.files.highlightVideo[0],
        folder: "recipe_videos",
        allowedTypes: ["mp4", "mov"],
        maxFileSize: 50 * 1024 * 1024, // 50mb
      });
    }

    // Additional Pictures
    if (req.files.additionalPictures) {
      recipeMediaUrls.additionalPicturesUrls = await Promise.all(
        req.files.additionalPictures.map((file) =>
          handleSupabaseUpload({
            file,
            folder: "recipe_pictures",
            allowedTypes: ["jpeg", "png"],
            maxFileSize: 10 * 1024 * 1024, // 10mb
          })
        )
      );
    }
  }

  console.log(recipeMediaUrls);

  const recipeData = {
    ...req.body,
    byUser: req.user.userId,
    ...recipeMediaUrls,
  };

  createRecipeSchema.parse(recipeData);

  const newRecipe = await this.create(recipeData);

  const newModeration = await Moderation.createModeration(
    newRecipe._id.toString()
  );

  newRecipe.moderationInfo = newModeration._id;

  return await newRecipe.save();
};

//  Find and update Recipe
// TODO: Babaguhin to kapag sa update yung sa logic kung pano iuupdate yung picture sa supabase kapag tinaggal yung picture url sa database
RecipeSchema.statics.updateRecipe = async function (req) {
  const recipeId = req.params.recipeId;
  const updates = req.body;
  const userId = req.user.userId;

  // Supabase File Uploads
  // Recipe Main Display Picture
  if (req.files) {
    if (req.files.mainPicture) {
      updates.mainPictureUrl = await handleSupabaseUpload({
        file: req.files.mainPicture[0],
        folder: "recipe_pictures",
        allowedTypes: ["jpeg", "png"],
        maxFileSize: 10 * 1024 * 1024, // 10mb
      });
    }

    // Recipe Highlight Video
    if (req.files.highlightVideo) {
      updates.videoUrl = await handleSupabaseUpload({
        file: req.files.highlightVideo[0],
        folder: "recipe_videos",
        allowedTypes: ["mp4", "mov"],
        maxFileSize: 50 * 1024 * 1024, // 50mb
      });
    }

    // Additional Pictures
    if (req.files.additionalPictures) {
      updates.additionalPicturesUrls = await Promise.all(
        req.files.additionalPictures.map((file) =>
          handleSupabaseUpload({
            file,
            folder: "recipe_pictures",
            allowedTypes: ["jpeg", "png"],
            maxFileSize: 10 * 1024 * 1024, // 10mb
          })
        )
      );
    }
  }

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

  console.log(`Page: ${page}, Limit: ${limit}`); // Debugging log

  //Count Approved Recipes
  const approvedRecipeCount = await this.aggregate([
    ...recipeAggregationPipeline(filter, {
      "moderationInfo.status": "approved",
    }),
    { $count: "total" }, 
  ]);

  const totalApprovedRecipes = approvedRecipeCount[0]?.total || 0;

  // ✅ Fetch Approved Recipes (WITH Pagination)
  const approvedRecipesData = await this.aggregate([
    ...recipeAggregationPipeline(
      filter,
      { "moderationInfo.status": "approved" },
      [...commentCountPipeline, ...reactionCountPipeline]
    ),
    { $sort: { ...sortOrder } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ]);

  return {
    totalApprovedRecipes,
    recipes: approvedRecipesData,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(totalApprovedRecipes / limit), // 
    },
  };
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
RecipeSchema.statics.getRecipeById = async function (req) {
  const { recipeId } = req.params;
  const userInteractedId = req.user.userId;

  validateObjectId(userInteractedId, "User");
  validateObjectId(recipeId, "Recipe");

  console.log("RecipeId:", recipeId);

  const recipe = await this.aggregate([
    ...recipeAggregationPipeline(
      {},
      {
        _id: new mongoose.Types.ObjectId(recipeId),
        "moderationInfo.status": "approved",
      },
      [...commentPreviewPipeline, ...commentCountPipeline],
      [{ $limit: 1 }]
    ),
  ]).then((res) => res[0] || null);

  if (!recipe) throw new CustomError("Recipe not found", 404);

  if (recipe.deletedAt)
    throw new CustomError("Recipe has already been deleted", 404);

  const userReaction = await Reaction.findOne({
    fromPost: recipeId,
    byUser: userInteractedId,
    deletedAt: { $in: [null, undefined] },
  })
    .select("reaction")
    .lean();
  recipe.userReaction = userReaction;

  const totalReactions = await Reaction.countDocuments({
    fromPost: recipeId,
    deletedAt: { $in: [null, undefined] },
  });
  recipe.totalReactions = totalReactions;

  return recipe;
};

// Feature Recipe
// ? How about unfeaturing a recipe, address this soon when implemented on front end
// ? Can I do this as a toggle instead soon
RecipeSchema.statics.toggleFeatureRecipe = async function (recipeId) {
  validateObjectId(recipeId, "Recipe");

  const recipe = await this.findOne({ _id: recipeId }).populate(
    "moderationInfo",
    "status"
  );

  if (!recipe) throw new CustomError("Recipe not found", 404);

  if (recipe.moderationInfo.status !== "approved")
    throw new CustomError("Only approved recipes can be featured", 400);

  // Toggle isFeatured status
  recipe.isFeatured = !recipe.isFeatured;

  await recipe.save();
  return recipe;
};

// Get Featured Recipes
RecipeSchema.statics.getFeaturedRecipes = async function (query) {
  const { page, limit, filter, sortOrder } = this.extractQueryParams(query);

  // Count pending recipes
  const featuredRecipeCount = await this.aggregate([
    ...recipeAggregationPipeline(filter, {
      "moderationInfo.status": "approved",
      isFeatured: true,
    }),

    { $count: "total" },
  ]);

  const totalFeaturedRecipes = featuredRecipeCount[0]?.total || 0;

  // Fetch recipes data
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
