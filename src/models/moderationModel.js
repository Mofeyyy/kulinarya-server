const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ModerationSchema = new Schema(
  {
    forPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },

    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      required: true,
    },

    notes: {
      type: String,
      default: "",
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },

  { timestamps: true } // Automatically includes createdAt and updatedAt fields
);

// Export the Moderation model
module.exports = mongoose.model("Moderation", ModerationSchema);
