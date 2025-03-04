import expressAsyncHandler from "express-async-handler";

// Imported Models
import Announcement from "../models/announcementModel.js";

// ---------------------------------------------------------------------------

export const createAnnouncement = expressAsyncHandler(async (req, res) => {
  const result = await Announcement.createAnnouncement(req);

  res.status(201).json({
    success: true,
    statusCode: 201,
    message: "Announcement Created Successfully",
    ...result,
  });
});

export const getAnnouncements = expressAsyncHandler(async (req, res) => {
  const result = await Announcement.getAnnouncements(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Announcements Fetched Successfully",
    ...result,
  });
});

export const getAllActiveAnnouncements = expressAsyncHandler(async (req, res) => {
  const result = await Announcement.getAllActiveAnnouncements(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Active Announcements Fetched Successfully",
    ...result,
  });
});

export const updateAnnouncement = expressAsyncHandler(async (req, res) => {
  const result = await Announcement.updateAnnouncement(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Announcement Updated Successfully",
    ...result,
  });
});

export const softDeleteAnnouncement = expressAsyncHandler(async (req, res) => {
  await Announcement.softDeleteAnnouncement(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Announcement Deleted Successfully",
  });
});
