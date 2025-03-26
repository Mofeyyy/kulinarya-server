import expressAsyncHandler from "express-async-handler";

// Imported Models
import Reaction from "../models/reactionModel.js";

//  ------------------------------------------------------------

// TODO: Fetch All Post Reactions
export const fetchAllReactions = expressAsyncHandler(async (req, res) => {
  const result = await Reaction.fetchAllReactions(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Reactions Fetched Successfully",
    ...result,
  });
});

export const toggleReaction = expressAsyncHandler(async (req, res) => {
  const { reaction, notification, isNewReaction, isSoftDeleted } =
    await Reaction.toggleReaction(req);

  const statusCode = isNewReaction ? 201 : 200;

  res.status(statusCode).json({
    success: true,
    statusCode: statusCode,
    message: `Reaction ${
      isSoftDeleted ? "Soft Deleted" : "Toggled and Recipe Owner Notified"
    }  Successfully`,
    reaction,
    notification,
  });
});

export const getTopReactedPost = expressAsyncHandler(async (req, res) => {
  const { timeframe } = req.query; // Accepts 'week' or 'month'

  try {
    const topReactedPost = await Reaction.getTopReactedPost(timeframe);
    res.status(200).json({ success: true, data: topReactedPost });
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
});
