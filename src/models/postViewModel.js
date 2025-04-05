import { Schema, model } from "mongoose";
import mongoose from "mongoose";
import CustomError from "../utils/customError.js";
import { trackPostViewSchema } from "../validations/postViewValidation.js";


// ---------------------------------------------------------------------------

const PostViewSchema = new Schema(
  {
    fromPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecipePost",
      required: true,
    },
    viewType: {
      type: String,
      enum: ["user", "guest"],
      required: true,
    },
    byUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    byGuest: {
      type: String, // Store guest's IP address
      default: null,
    },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------

PostViewSchema.statics.trackView = async function (req) {
  const { fromPost, viewType, byUser, byGuest } = req.body;

  // Determine viewType and assign user/guest dynamically
  const finalViewType = viewType || (req.user ? "user" : "guest");
  const finalByUser = req.user ? req.user.userId : byUser || null;
  const finalByGuest = !req.user ? req.ip : byGuest || null;

  // Validate input using Zod
  const validatedData = trackPostViewSchema.parse({
    fromPost,
    viewType: finalViewType,
    byUser: finalByUser,
    byGuest: finalByGuest,
  });

  // Set the time limit (e.g., 1 day)
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  let existingView;

  if (finalViewType === "user") {
    // Check if user has already viewed this post within the last day
    existingView = await this.findOne({
      fromPost,
      byUser: finalByUser,
      createdAt: { $gte: oneDayAgo },
    });
  } else {
    // Check if guest (IP) has already viewed this post within the last day
    existingView = await this.findOne({
      fromPost,
      byGuest: finalByGuest,
      createdAt: { $gte: oneDayAgo },
    });
  }

  if (existingView) {
    throw new CustomError("View already recorded within the last day", 429); // 429 = Too Many Requests
  }

  // Create the post view record
  const newView = await this.create(validatedData);
  return { postView: newView };
};

PostViewSchema.statics.getPostViews = async function (req) {
  const { recipeId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(recipeId)) {
    throw new CustomError("Invalid Recipe ID", 400);
  }

  const views = await this.countDocuments({ fromPost: recipeId });
  return { recipeId, views };
};




PostViewSchema.statics.getTopPostViews = async function () {
  const startOfMonth = new Date(new Date().setDate(1)); // First day of the current month
  const endOfMonth = new Date(); // Today's date

  // Step 1: Get total post views overall
  const totalPostViewsResult = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      }
    },
    {
      $group: {
        _id: null, // Group all views together
        totalPostViews: { $sum: 1 }
      }
    }
  ]);

  const totalPostViews = totalPostViewsResult.length > 0 ? totalPostViewsResult[0].totalPostViews : 0;

  // Step 2: Get the top viewed posts
  const topViewedPosts = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      }
    },
    {
      $group: {
        _id: "$fromPost",
        totalViews: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: "recipes",
        localField: "_id",
        foreignField: "_id",
        as: "recipe"
      }
    },
    { $unwind: "$recipe" },
    {
      $lookup: {
        from: "users",
        localField: "recipe.byUser",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "fromPost",
        as: "comments"
      }
    },
    {
      $lookup: {
        from: "reactions",
        localField: "_id",
        foreignField: "fromPost",
        as: "reactions"
      }
    },
    {
      $project: {
        _id: "$recipe._id",
        title: "$recipe.title",
        mainPictureUrl: "$recipe.mainPictureUrl", // ✅ Ensure this is included
        totalViews: 1,
        totalComments: { $size: "$comments" },
        totalReactions: { $size: "$reactions" },
        "byUser.firstName": "$user.firstName",
        "byUser.lastName": "$user.lastName"
      }
    },
    { $sort: { totalViews: -1 } },
    { $limit: 10 }
  ]);

  return { totalPostViews, topViewedPosts };
};







const PostView = model("PostView", PostViewSchema);
export default PostView;
