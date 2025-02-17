import { Schema, model } from "mongoose";
import mongoose from "mongoose";

const AnnouncementSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },

  { timestamps: true }
);

const Announcement = model("Announcement", AnnouncementSchema);
export default Announcement;

