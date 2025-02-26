import expressAsyncHandler from "express-async-handler";

// Imported Models
import Comment from "../models/commentModel.js";

// ---------------------------------------------------------------------------

export const addRecipeComment = expressAsyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { recipeId } = req.params;
  const { content } = req.body;

  const newComment = await Comment.addComment({
    fromPost: recipeId,
    byUser: userId,
    content,
  });

  res.status(201).json({
    success: true,
    statusCode: 201,
    message: "Comment added successfully",
    comment: newComment,
  });
});

export const updateRecipeComment = expressAsyncHandler(async (req, res) => {
  await Comment.updateComment(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Comment updated successfully",
  });
});

export const softDeleteRecipeComment = async (req, res) => {
  const updatedComment = await Comment.softDeleteComment(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Comment Deleted Successfully",
    comment: updatedComment,
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
