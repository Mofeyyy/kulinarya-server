import { Schema, model } from "mongoose";
import mongoose from "mongoose";

const CommentSchema = new Schema(
  {
    fromPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },

    byUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Static method to find and check if a comment exists
CommentSchema.statics.findAndCheckOwnership = async function (commentId, userId) {
  const comment = await this.findOne({ _id: commentId, byUser: userId, deletedAt: null });
  if (!comment) throw new Error("Comment not found or user not authorized");
  return comment;
};

// Static method to handle soft deletion of comment
CommentSchema.statics.softDeleteComment = async function (commentId, userId) {
  const comment = await this.findAndCheckOwnership(commentId, userId);
  comment.deletedAt = new Date();
  await comment.save();
  return comment;
};

const Comment = model("Comment", CommentSchema);
export default Comment;
