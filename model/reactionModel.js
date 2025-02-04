const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ReactionSchema = new Schema(
  {
    fromPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecipePost",
      required: true,
    },
    byUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reaction: {
      type: String,
      enum: ["heart", "drool", "neutral", null],
      default: null,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reaction", ReactionSchema);
