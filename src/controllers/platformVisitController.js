import expressAsyncHandler from "express-async-handler";

// Imported Model
import PlatformVisit from "../models/platformVisitModel.js";

// ---------------------------------------------------------------------------

export const trackVisit = expressAsyncHandler(async (req, res) => {
  const result = await PlatformVisit.trackVisit(req);

  res.status(201).json({
    success: true,
    statusCode: 201,
    message: "Platform Visit Tracked Successfully",
    ...result,
  });
});

export const getPlatformVisits = expressAsyncHandler(async (req, res) => {
  const result = await PlatformVisit.getPlatformVisits();

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Platform Visits Fetched Successfully",
    ...result,
  });
});
