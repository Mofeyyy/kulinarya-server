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

// Imported Models
import Recipe from "./recipeModel.js";
import Notification from "./notificationModel.js";
import { validate } from "uuid";

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

CommentSchema.statics.addComment = async function (req) {
  const { recipeId } = req.params;
  const { content } = req.body;
  const userInteractedId = req.user.userId;
  const userInteractedFirstName = req.user.firstName;

  validateObjectId(recipeId, "Recipe");
  validateObjectId(userInteractedId, "User");

  const recipe = await Recipe.findById(recipeId).select("byUser title").lean();
  if (!recipe) throw new CustomError("Recipe not found", 404);

  const recipeOwnerId = recipe.byUser.toString();
  const recipeTitle = recipe.title;

  validateObjectId(recipeOwnerId, "User");

  const commentData = addCommentSchema.parse({
    fromPost: recipeId,
    byUser: userInteractedId,
    content,
  });

  let comment = await this.create(commentData);

  comment = await this.findById(comment._id).populate(
    "byUser",
    "firstName lastName middleName profilePicture"
  );

  if (!comment) {
    throw new CustomError("Failed to create comment", 500);
  }

  const notification = await Notification.handleCommentNotification({
    byUser: {
      userInteractedId,
      userInteractedFirstName,
    },
    fromPost: {
      recipeId,
      recipeOwnerId,
      recipeTitle,
    },
  });

  return { comment, notification };
};

CommentSchema.statics.updateComment = async function (req) {
  const { commentId } = req.params;
  const newComment = req.body.content;
  const userInteractedId = req.user.userId;

  validateObjectId(commentId, "Comment");

  const comment = await this.findOne({ _id: commentId });
  if (!comment) throw new CustomError("Comment not found", 404);

  const recipeId = comment.fromPost;

  validateObjectId(recipeId, "Recipe");

  const recipe = await Recipe.findById(recipeId).select("byUser title").lean();
  if (!recipe) throw new CustomError("Recipe not found", 404);

  console.log("New Comment:", newComment);

  updateCommentSchema.parse({ content: newComment });

  const existingComment = await this.findOne({
    _id: commentId,
    deletedAt: { $in: [null, undefined] },
  }).select("byUser content");

  if (!existingComment) throw new CustomError("Comment not found", 404);

  if (existingComment.byUser.toString() !== userInteractedId)
    throw new CustomError("Unauthorized", 401);

  existingComment.content = newComment;
  const updatedComment = await existingComment.save();

  return { comment: updatedComment };
};

CommentSchema.statics.softDeleteComment = async function (req) {
  const { commentId } = req.params;
  const userInteractedId = req.user.userId;

  validateObjectId(commentId, "Comment");

  const comment = await this.findOne({ _id: commentId });
  if (!comment) throw new CustomError("Comment not found", 404);

  const recipeId = comment.fromPost;
  const commentOwnerId = comment.byUser.toString();

  validateObjectId(commentOwnerId, "User");
  validateObjectId(recipeId, "Recipe");

  const recipe = await Recipe.findById(recipeId).select("byUser").lean();
  if (!recipe) throw new CustomError("Recipe not found", 404);
  const recipeOwnerId = recipe.byUser.toString();
  const recipeTitle = recipe.title;

  validateObjectId(recipeOwnerId, "User");

  if (commentOwnerId !== userInteractedId)
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
