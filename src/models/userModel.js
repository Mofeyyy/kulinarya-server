const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ["admin", "creator", "user"],
      default: "user",
    },

    firstName: {
      type: String,
      required: true,
    },

    middleName: {
      type: String,
      default: "",
    },

    lastName: {
      type: String,
      required: true,
    },

    profilePictureUrl: {
      type: String,
      default: "",
    },

    bio: {
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

module.exports = mongoose.model("User", UserSchema);
