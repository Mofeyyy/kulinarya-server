import expressAsyncHandler from "express-async-handler";

// Imported Models
import Comment from "../models/commentModel.js";

// ---------------------------------------------------------------------------

export const addRecipeComment = expressAsyncHandler(async (req, res) => {
  const result = await Comment.addComment(req);

  res.status(201).json({
    success: true,
    statusCode: 201,
    message: "Comment Added and Recipe Owner Notified Successfully",
    ...result,
  });
});

export const updateRecipeComment = expressAsyncHandler(async (req, res) => {
  const result = await Comment.updateComment(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Comment Updated and Recipe Owner Notified Successfully",
    ...result,
  });
});

export const softDeleteRecipeComment = async (req, res) => {
  await Comment.softDeleteComment(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Comment Deleted Successfully",
  });
};

export const fetchAllPostComments = expressAsyncHandler(async (req, res) => {
  const result = await Comment.fetchAllPostComments(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Comments Fetched Successfully",
    ...result,
  });
});

export const getOverallComments = expressAsyncHandler(async (req, res) => {
  const { totalComments } = await Comment.fetchOverallComments();
  res.status(200).json({ totalComments });
});
