import expressAsyncHandler from "express-async-handler";

// Imported Model
import PostView from "../models/postViewModel.js";
import Recipe from "../models/recipeModel.js";

// ---------------------------------------------------------------------------

export const trackPostView = expressAsyncHandler(async (req, res) => {
  const result = await PostView.trackView(req);

  res.status(201).json({
    success: true,
    statusCode: 201,
    message: "Post View Tracked Successfully",
    ...result,
  });
});

export const getPostViews = expressAsyncHandler(async (req, res) => {
  const result = await PostView.getPostViews(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Post Views Fetched Successfully",
    ...result,
  });
});

export const getTopRecipePostViews = expressAsyncHandler(async (req, res) => {
  const result = await PostView.getTopPostViews();

  const reorderedData = result.topViewedPosts.map(({ 
    _id, 
    title, 
    mainPictureUrl, // ✅ Include this
    totalViews, 
    totalComments, 
    totalReactions, 
    byUser 
  }) => ({
    _id,
    title,
    mainPictureUrl, // ✅ Ensure it's in the response
    totalViews,
    totalComments,
    totalReactions,
    byUser: {
      firstName: byUser?.firstName || "Unknown",
      lastName: byUser?.lastName || "Unknown"
    }
  }));

  console.log("Result:", reorderedData);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Top Viewed Posts Fetched Successfully",
    topViewedPosts: reorderedData
  });
});




