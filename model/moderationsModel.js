const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Moderation Schema
const ModerationSchema = new Schema(
  {
    forPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecipePost", // referencing the RecipePost collection
      required: true,
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // referencing the User collection (user who moderates the post)
      required: true,
    },
    status: {
      type: String,
      enum: ["approved", "pending", "rejected"], // status of moderation
      required: true,
    },
    notes: {
      type: String,
      default: "", // Optional notes about the moderation
    },
    deletedAt: {
      type: Date,
      default: null, // Soft delete the moderation entry, if needed
    },
  },
  { timestamps: true } // Automatically includes createdAt and updatedAt fields
);

// Export the Moderation model
module.exports = mongoose.model("Moderation", ModerationSchema);
