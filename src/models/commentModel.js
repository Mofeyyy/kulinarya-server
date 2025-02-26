import { Schema, isValidObjectId, model } from "mongoose";
import mongoose from "mongoose";

// Imported Schemas
import {
  addCommentSchema,
  updateCommentSchema,
} from "../validations/commentValidation.js";

// Imported Utils
import CustomError from "../utils/customError.js";
import { validateObjectId } from "../utils/validators.js";

// ---------------------------------------------------------------------------

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

CommentSchema.statics.addComment = async function (commentData) {
  addCommentSchema.parse(commentData);

  isValidObjectId(commentData.fromPost, "Recipe");

  return await this.create(commentData);
};

CommentSchema.statics.updateComment = async function (req) {
  const { content } = req.body;
  const { commentId } = req.params;
  const { userId } = req.user;

  validateObjectId(commentId, "Comment");

  updateCommentSchema.parse({ content });

  const comment = await this.findOne({
    _id: commentId,
    deletedAt: { $in: [null, undefined] },
  }).select("byUser content");

  if (!comment) throw new CustomError("Comment not found", 404);

  if (comment.byUser.toString() !== userId)
    throw new CustomError("Unauthorized", 401);

  comment.content = content;

  return await comment.save();
};

CommentSchema.statics.softDeleteComment = async function (req) {
  const { commentId } = req.params;
  const { userId } = req.user;

  const comment = await this.findOne({
    _id: commentId,
    deletedAt: { $in: [null, undefined] },
  }).select("byUser");

  if (!comment) throw new CustomError("Comment not found", 404);

  if (comment.byUser.toString() !== userId)
    throw new CustomError("Unauthorized", 401);

  comment.deletedAt = new Date();
  await comment.save();

  return;
};

// Fetching Comments - Cursor based approach (Last Fetched Timestamp)
CommentSchema.statics.fetchAllPostComments = async function (req) {
  const { recipeId } = req.params;
  const { limit = 10, cursor } = req.query;
  // cursor is the last createdAt timestamp of the last fetched comment

  validateObjectId(recipeId, "Recipe");

  const filter = {
    fromPost: recipeId,
    $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
  };

  if (cursor) {
    filter.createdAt = { $lt: new Date(cursor) };
  } // If cursor of last comment fetched timestamp is provided, filter comments created before that timestamp

  const comments = await this.find(filter)
    .populate("byUser", "firstName middleName lastName profilePictureUrl")
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .lean();

  // Set if there is still cursor to fetch more comments
  const newCursor =
    comments.length > 0 ? comments[comments.length - 1].createdAt : null;

  return { comments, cursor: newCursor };
};

const Comment = model("Comment", CommentSchema);
export default Comment;
