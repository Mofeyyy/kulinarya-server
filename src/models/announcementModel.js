import { Schema, model } from "mongoose";
import mongoose from "mongoose";
import CustomError from "../utils/customError.js";
import Notification from "./notificationModel.js"; // Import Notification Model
import { createAnnouncementSchema } from "../validations/announcementValidation.js";

// ---------------------------------------------------------------------------

const AnnouncementSchema = new Schema(
  {
    title:
    {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    deletedAt: {
      type: Date,
      default: null
    },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------

AnnouncementSchema.statics.createAnnouncement = async function (req) {
  const { title, content } = req.body;
  const createdBy = req.user.userId;

  // Validate input using Zod
  const validatedData = createAnnouncementSchema.parse({ title, content, createdBy:req.user.userId });

  // Create the announcement
  const announcement = await this.create(validatedData);

  // Notify all users about the new announcement
  await Notification.createAnnouncementNotification({ announcementId: announcement._id, createdBy: req.user.userId });

  return { announcement };
};

AnnouncementSchema.statics.getAnnouncements = async function () {
  const announcements = await this.find().sort({ createdAt: -1 });
  return { announcements };
};

AnnouncementSchema.statics.getAllActiveAnnouncements = async function () {
  const announcements = await this.find({ isActive: true, deletedAt: null }).sort({ createdAt: -1 });
  return { announcements };
};

AnnouncementSchema.statics.updateAnnouncement = async function (req) {
  const { announcementId } = req.params;
  const { title, content, isActive } = req.body;

  const announcement = await this.findById(announcementId);
  if (!announcement) throw new CustomError("Announcement not found", 404);

  if (title) announcement.title = title;
  if (content) announcement.content = content;
  if (typeof isActive === "boolean") announcement.isActive = isActive;

  await announcement.save();
  return { announcement };
};

AnnouncementSchema.statics.softDeleteAnnouncement = async function (req) {
  const { announcementId } = req.params;

  const announcement = await this.findById(announcementId);
  if (!announcement) throw new CustomError("Announcement not found", 404);

  announcement.deletedAt = new Date();
  await announcement.save();
};

const Announcement = model("Announcement", AnnouncementSchema);
export default Announcement;
