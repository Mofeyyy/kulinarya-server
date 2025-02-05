const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CommentSchema = new Schema(
  {
    fromPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },

    byUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

  { timestamps: true }
);

// Export the Comment model
module.exports = mongoose.model("Comment", CommentSchema);
