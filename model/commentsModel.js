const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Comment Schema
const CommentSchema = new Schema(
  {
    fromPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecipePost", // referencing the RecipePost collection
      required: true,
    },
    byUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // referencing the User collection
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true } // Automatically includes createdAt and updatedAt fields
);

// Export the Comment model
module.exports = mongoose.model("Comment", CommentSchema);
