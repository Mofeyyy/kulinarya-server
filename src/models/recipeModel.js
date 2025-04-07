import { Schema, model } from "mongoose";
import mongoose from "mongoose";

// Imported Models
import Moderation from "./moderationModel.js";
import Reaction from "./reactionModel.js";
import Notification from "./notificationModel.js";

// Imported Validations
import {
  createRecipeSchema,
  updateRecipeSchema,
} from "../validations/recipeValidations.js";

// Imported Utilities
import CustomError from "../utils/customError.js";
import { validateObjectId } from "../utils/validators.js";
import handleSupabaseUpload from "../utils/handleSupabaseUpload.js";
import deleteSupabaseFile from "../utils/deleteSupabaseFile.js";

// Imported Aggregation Pipelines
import {
  recipeAggregationPipeline,
  commentCountPipeline,
  commentPreviewPipeline,
  reactionCountPipeline,
  postViewCountPipeline,
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

    // ? Bakit nilagyan ng ganito dito para saan?
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
    query.sortOrder === "newest" ? { updatedAt: -1 } : { updatedAt: 1 };

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
  const { userId } = req.user;
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
        allowedTypes: ["jpeg", "png", "webp"],
        maxFileSize: 2 * 1024 * 1024, // 2mb
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
            allowedTypes: ["jpeg", "png", "webp"],

            maxFileSize: 2 * 1024 * 1024, // 2mb
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

  const recipe = await newRecipe.save();

  console.log("New Recipe:", recipe);

  await Notification.create({
    forUser: userId,
    fromPost: recipe._id,
    type: "moderation",
    content: `Your recipe "${recipe.title}" has been submitted for moderation. Please wait for the moderator's review. Click here to track status.`,
  });

  return recipe;
};

//  Find and update Recipe
RecipeSchema.statics.updateRecipe = async function (req) {
  req.body.ingredients = req.body.ingredients
    ? JSON.parse(req.body.ingredients)
    : [];
  req.body.procedure = req.body.procedure ? JSON.parse(req.body.procedure) : [];
  req.body.additionalPicturesUrls = req.body.additionalPicturesUrls
    ? JSON.parse(req.body.additionalPicturesUrls)
    : [];

  console.log("Parsed Ingredients:", req.body.ingredients);
  console.log("Parsed Procedure:", req.body.procedure);
  console.log("Parsed Additional Pictures:", req.body.additionalPicturesUrls);
  console.log("Request Files:", req.files);

  const recipeId = req.params.recipeId;
  const updates = req.body;
  const userId = req.user.userId;

  validateObjectId(recipeId, "Recipe ID");

  const existingRecipe = await this.findOne({ _id: recipeId, byUser: userId })
    .select("mainPictureUrl videoUrl additionalPicturesUrls")
    .lean();

  if (!existingRecipe) throw new CustomError("Recipe Not Found!", 404);

  // Supabase File Uploads & Old File Deletion
  if (req.files) {
    if (req.files.mainPicture) {
      if (existingRecipe.mainPictureUrl) {
        await deleteSupabaseFile(existingRecipe.mainPictureUrl);
      }

      updates.mainPictureUrl = await handleSupabaseUpload({
        file: req.files.mainPicture[0],
        folder: "recipe_pictures",
        allowedTypes: ["jpeg", "png", "webp"],
        maxFileSize: 2 * 1024 * 1024, // 2MB
      });
    }

    if (req.files.video) {
      if (existingRecipe.videoUrl) {
        await deleteSupabaseFile(existingRecipe.videoUrl);
      }

      updates.videoUrl = await handleSupabaseUpload({
        file: req.files.video[0],
        folder: "recipe_videos",
        allowedTypes: ["mp4", "mov"],
        maxFileSize: 50 * 1024 * 1024, // 50MB
      });
    }
  }

  // If user delete the video
  if (
    (updates.video === undefined || updates.video === null) &&
    existingRecipe.videoUrl
  ) {
    await deleteSupabaseFile(existingRecipe.videoUrl);
    updates.videoUrl = null;
  }

  // Handle Additional Pictures
  if (
    Array.isArray(updates.additionalPicturesUrls) ||
    req.files?.additionalPictures
  ) {
    const existingPicturesUrls = existingRecipe.additionalPicturesUrls || [];
    const keptPicturesUrls =
      updates.additionalPicturesUrls?.filter((url) =>
        existingPicturesUrls.includes(url)
      ) || []; // Keep the existing ones

    const removedPictures = existingPicturesUrls.filter(
      (url) => !keptPicturesUrls.includes(url)
    );

    if (removedPictures.length > 0) {
      await Promise.all(removedPictures.map((url) => deleteSupabaseFile(url)));
    }

    // If there are new uploaded files, process them
    const uploadedPictureUrls = req.files?.additionalPictures
      ? await Promise.all(
          req.files.additionalPictures.map((file) =>
            handleSupabaseUpload({
              file,
              folder: "recipe_pictures",
              allowedTypes: ["jpeg", "png", "webp"],
              maxFileSize: 2 * 1024 * 1024, // 2MB
            })
          )
        )
      : [];

    updates.additionalPicturesUrls = [
      ...keptPicturesUrls,
      ...uploadedPictureUrls,
    ];
  }

  updateRecipeSchema.parse(updates);

  const updatedRecipe = await this.findOneAndUpdate(
    {
      _id: recipeId,
      byUser: userId,
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
    },
    updates,
    { new: true, runValidators: true }
  );

  // Set to pending
  if (updatedRecipe) {
    await Moderation.findOneAndUpdate(
      {
        forPost: recipeId,
      },
      {
        moderatedBy: null,
        status: "pending",
        notes: "",
      }
    );

    await Notification.findOneAndUpdate(
      {
        fromPost: recipeId,
        forUser: userId,
        type: "moderation",
      },
      {
        byUser: null,
        content: `Your recipe "${updatedRecipe.title}" has been updated. Click here to track status.`,
        deletedAt: null,
        isRead: false,
      },
      { new: true }
    );
  }

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

  // For Custom Sorting -> Feature Admin Page
  const customSort = query.forFeaturedRecipes
    ? { isFeatured: -1, ...sortOrder }
    : { ...sortOrder };

  console.log(`Page: ${page}, Limit: ${limit}`); // Debugging log

  //Count Approved Recipes
  const approvedRecipeCount = await this.aggregate([
    ...recipeAggregationPipeline(filter, {
      "moderationInfo.status": "approved",
    }),
    { $count: "total" },
  ]);

  const totalApprovedRecipes = approvedRecipeCount[0]?.total || 0;
  const totalPages = Math.ceil(totalApprovedRecipes / limit);
  const hasNextPage = page < totalPages;

  // Fetch with pagination
  const approvedRecipesData = await this.aggregate([
    ...recipeAggregationPipeline(
      filter,
      { "moderationInfo.status": "approved" },
      [
        ...commentCountPipeline,
        ...reactionCountPipeline,
        ...postViewCountPipeline,
      ]
    ),
    {
      $project: {
        title: 1,
        "byUser._id": 1,
        "byUser.firstName": 1,
        "byUser.lastName": 1,
        "byUser.profilePictureUrl": 1,
        mainPictureUrl: 1,
        isFeatured: 1,
        createdAt: 1,
        updatedAt: 1,
        totalComments: 1,
        totalReactions: 1,
        totalViews: 1,
        totalEngagement: {
          $add: ["$totalComments", "$totalReactions", "$totalViews"],
        },
      },
    },

    { $sort: customSort },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ]);

  return {
    totalApprovedRecipes,
    recipes: approvedRecipesData,
    pagination: {
      page,
      limit,
      totalPages,
      hasNextPage,
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
  const totalPages = Math.ceil(totalPendingRecipes / limit);
  const hasNextPage = page < totalPages;

  // Fetch recipes data
  const pendingRecipesData = await this.aggregate([
    ...recipeAggregationPipeline(filter, {
      "moderationInfo.status": "pending",
    }),
    { $sort: { ...sortOrder } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ]);

  return {
    pendingRecipesData,
    totalPendingRecipes,
    pagination: {
      page,
      limit,
      totalPages,
      hasNextPage,
    },
  };
};

// Get Approved Recipe by ID - For Viewing in Recipe Viewing Page
RecipeSchema.statics.getApprovedRecipeById = async function (req) {
  const { recipeId } = req.params;
  const userInteractedId = req.user?.userId;

  validateObjectId(recipeId, "Recipe");

  const recipe = await this.aggregate([
    ...recipeAggregationPipeline(
      {},
      {
        _id: new mongoose.Types.ObjectId(recipeId),
        "moderationInfo.status": "approved",
      },
      [
        ...commentPreviewPipeline,
        ...commentCountPipeline,
        ...postViewCountPipeline,
      ],
      [{ $limit: 1 }]
    ),
  ]).then((res) => res[0] || null);

  console.log("Recipe:", recipe);

  if (!recipe) throw new CustomError("Recipe not found", 404);

  if (recipe.deletedAt)
    throw new CustomError("Recipe has already been deleted", 404);

  if (userInteractedId) {
    validateObjectId(userInteractedId, "User");

    const userReaction = await Reaction.findOne({
      fromPost: recipeId,
      byUser: userInteractedId,
      deletedAt: { $in: [null, undefined] },
    })
      .select("reaction")
      .lean();
    recipe.userReaction = userReaction;
  }

  const totalReactions = await Reaction.countDocuments({
    fromPost: recipeId,
    deletedAt: { $in: [null, undefined] },
  });
  recipe.totalReactions = totalReactions;

  return recipe;
};

// Feature Recipe
RecipeSchema.statics.toggleFeatureRecipe = async function (req) {
  const recipeId = req.params.recipeId;

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

RecipeSchema.statics.getTopEngagedRecipes = async function () {
  const topEngagedRecipes = await this.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "byUser",
        foreignField: "_id",
        as: "userDetails",
      },
    },

    {
      $lookup: {
        from: "reactions",
        localField: "_id",
        foreignField: "fromPost",
        as: "reactions",
      },
    },

    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "fromPost",
        as: "comments",
      },
    },

    {
      $lookup: {
        from: "postviews",
        localField: "_id",
        foreignField: "fromPost",
        as: "postViews",
      },
    },

    {
      $project: {
        mainPictureUrl: 1,
        title: 1,
        byUser: {
          firstName: { $arrayElemAt: ["$userDetails.firstName", 0] },
          lastName: { $arrayElemAt: ["$userDetails.lastName", 0] },
        },
        totalReactions: { $size: "$reactions" },
        totalComments: { $size: "$comments" },
        totalViews: { $size: "$postViews" },
        totalEngagement: {
          $sum: [
            { $size: "$reactions" },
            { $size: "$comments" },
            { $size: "$postViews" },
          ],
        },
      },
    },

    { $sort: { totalEngagement: -1 } },
    { $limit: 5 },
  ]);

  return topEngagedRecipes;
};

// Get Recipe Without Moderation Constraints -> For Edit Recipe
RecipeSchema.statics.getRecipeById = async function (req) {
  const { recipeId } = req.params;
  const { userId } = req.user;
  const userInteractedId = userId;

  validateObjectId(recipeId, "Recipe");

  const recipe = await this.findById(recipeId).populate("byUser").lean();

  if (!recipe) throw new CustomError("Recipe not found", 404);
  if (recipe.deletedAt) throw new CustomError("Recipe deleted", 400);

  const isAuthorizedUser =
    recipe.byUser.toString() === userInteractedId.toString();

  if (isAuthorizedUser) throw new CustomError("Unauthorized Access", 401);

  return recipe;
};

const Recipe = model("Recipe", RecipeSchema);
export default Recipe;
