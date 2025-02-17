import { Schema, model } from "mongoose";

const RecipeSchema = new Schema(
  {
    byUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    foodCategory: {
      type: String,
      enum: ["dishes", "soup", "drinks", "desserts", "pastries"],
      required: true,
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
      type: [String],
      required: true,
    },

    procedure: {
      type: [
        {
          stepNumber: {
            type: Number,
            required: true,
          },
          content: {
            type: String,
            required: true,
          },
        },
      ],

      validate: [
        (arr) => arr.length > 0,
        "Procedure must have at least one step.",
      ], // Check if it is more than one, throw error if not.
    },

    moderationInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Moderation",
      default: null, // Initially null, but will update after creating a new document on Moderation Collection.
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

  { timestamps: true }
);

const Recipe = model("Recipe", RecipeSchema);
export default Recipe;
