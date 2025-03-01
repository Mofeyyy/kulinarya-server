import expressAsyncHandler from "express-async-handler";

// Imported Models
import Moderation from "../models/moderationModel.js";

// ------------------------------------------------------------------

// Handle Post Moderation
export const moderatePost = expressAsyncHandler(async (req, res) => {
  const result = await Moderation.moderatePost(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Recipe Moderated and Recipe Owner Notified Successfully",
    ...result,
  });
});
