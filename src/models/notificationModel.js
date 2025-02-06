const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Notification Schema
const NotificationSchema = new Schema(
  {
    forUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["moderation", "reaction", "comment"],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },

  { timestamps: true }
);

// Export the Notification model
module.exports = mongoose.model("Notification", NotificationSchema);
