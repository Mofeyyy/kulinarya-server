import { Schema, model } from "mongoose";

// Post View Schema
const PostViewSchema = new Schema(
  {
    fromPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },

    viewType: {
      type: String,
      enum: ["guest", "user"],
      required: true,
    },

    byUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    byGuest: {
      type: String,
      default: "",
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },

  { timestamps: true }
);

const PostView = model("PostView", PostViewSchema);
export default PostView;
