import Comment from "../models/commentModel.js";  // Import Comment model
import mongoose from "mongoose";

// Add a comment to a recipe
export const addRecipeComment = async (req, res) => {
  try {
    const { content, fromPost } = req.body;

    const newComment = await Comment.create({
      fromPost: new mongoose.Types.ObjectId(fromPost),
      byUser: req.user._id,
      content,
    });
    res.status(201).json(newComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update an existing comment
export const updateRecipeComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findAndCheckOwnership(req.params.commentId, req.user._id);
    comment.content = content;
    await comment.save();
    res.status(200).json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Soft delete a comment
export const softDeleteRecipeComment = async (req, res) => {
  try {
    const comment = await Comment.softDeleteComment(req.params.commentId, req.user._id);
    res.status(200).json({ message: "Comment deleted successfully", comment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
