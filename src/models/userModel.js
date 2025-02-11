// Imported Libraries
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Imported Utility Helper Functions
const { validateSignup } = require("../utils/validators");

const Schema = mongoose.Schema;

const userSchema = new Schema(
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

// Statics Static Method
userSchema.statics.signup = async function (
  email,
  password,
  firstName,
  lastName
) {
  try {
    // Validate user input
    validateSignup({ email, password, firstName, lastName });

    // Check if email exists
    const isEmailExists = await this.findOne({ email });
    if (isEmailExists) {
      throw Error("Email is already in use!");
    }

    // Hash the password with 10 salt rounds
    const hashedPassword = await bcrypt.hash(password, 10);

    return await this.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    }); // Create and return the new user
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = mongoose.model("User", userSchema);
