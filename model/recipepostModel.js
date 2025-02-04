const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Recipe Post Schema
const RecipePostSchema = new Schema(
  {
    byUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // referencing the User collection
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    foodCategory: {
      type: String,
      required: true,
    },
    dishes: {
      type: [String], // array to store various dish names
      default: [],
    },
    soup: {
      type: Boolean,
      default: false,
    },
    drinks: {
      type: Boolean,
      default: false,
    },
    desserts: {
      type: Boolean,
      default: false,
    },
    pastries: {
      type: Boolean,
      default: false,
    },
    originProvince: {
      type: String,
      required: true,
    },
    pictureUrl: {
      type: String,
      default: "",
    },
    videoUrl: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    ingredients: {
      type: [String], // array to hold ingredients
      required: true,
    },
    procedure: {
      type: [String], // array to hold procedure steps
      required: true,
    },
    moderationInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecipeModeration", // referencing the Recipe Moderation collection
      default: null,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true } // Automatically includes createdAt and updatedAt fields
);

// Export the Recipe Post model
module.exports = mongoose.model("RecipePost", RecipePostSchema);
