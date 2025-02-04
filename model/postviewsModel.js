const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Post View Schema
const PostViewSchema = new Schema(
  {
    fromPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecipePost", // referencing the RecipePost collection
      required: true,
    },
    viewType: {
      type: String,
      enum: ["guest", "user"], // Determines whether the view was from a guest or a registered user
      required: true,
    },
    byUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // referencing the User collection (for logged-in users)
      default: null,
    },
    byGuest: {
      type: String,
      default: "", // IP Address of the guest if the viewer is not logged in
    },
    deletedAt: {
      type: Date,
      default: null, // Soft delete
    },
  },
  { timestamps: true } // Automatically includes createdAt and updatedAt fields
);

// Export the Post View model
module.exports = mongoose.model("PostView", PostViewSchema);
