import expressAsyncHandler from "express-async-handler";

// Imported Models
import Notification from "../models/notificationModel.js";

// ----------------------------------------------------------------

export const getUserNotifications = expressAsyncHandler(async (req, res) => {
  const result = await Notification.getUserNotifications(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Notifications Fetched Successfully",
    ...result,
  });
});

export const readSpecificNotification = expressAsyncHandler(
  async (req, res) => {
    await Notification.readSpecificNotification(req);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Notification marked as read",
    });
  }
);

export const readAllNotifications = expressAsyncHandler(async (req, res) => {
  await Notification.readAllNotifications(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "All Notifications Marked as Read",
  });
});

export const softDeleteNotification = expressAsyncHandler(async (req, res) => {
  await Notification.softDeleteNotification(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Notification successfully soft deleted",
  });
});

// ? ----------------------------------------------------------------

// ? I don't think this is needed because we have a centralized notification handler for moderation, reactions, and comments.
// export const createNotification = expressAsyncHandler(async (req, res) => {
//   const notification = await Notification.createNotification(req.body);
//   res.status(201).json(notification);
// });
