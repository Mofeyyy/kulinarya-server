const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Announcement Schema
const AnnouncementSchema = new Schema(
  {
    title: {
      type: String,
      required: true, // Title of the announcement
    },
    content: {
      type: String,
      required: true, // Content of the announcement
    },
    isActive: {
      type: Boolean,
      default: true, // Indicates whether the announcement is active or not
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // referencing the User collection (creator of the announcement)
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null, // Soft delete, set to null if not deleted
    },
  },
  { timestamps: true } // Automatically includes createdAt and updatedAt fields
);

// Create and export the Announcement model
module.exports = mongoose.model("Announcement", AnnouncementSchema);
