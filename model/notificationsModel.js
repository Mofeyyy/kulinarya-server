const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Notification Schema
const NotificationSchema = new Schema(
  {
    forUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // referencing the User collection
      required: true,
    },
    type: {
      type: String,
      enum: ["moderation", "reaction", "comment"], // Notification types
      required: true,
    },
    content: {
      type: String,
      required: true, // Content of the notification (e.g., message or details)
    },
    isRead: {
      type: Boolean,
      default: false, // Tracks whether the notification has been read by the user
    },
    deletedAt: {
      type: Date,
      default: null, // Soft delete for the notification, instead of removing it
    },
  },
  { timestamps: true } // Automatically includes createdAt and updatedAt fields
);

// Export the Notification model
module.exports = mongoose.model("Notification", NotificationSchema);
