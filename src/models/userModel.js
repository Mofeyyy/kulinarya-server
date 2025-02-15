// Imported Libraries
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Imported Utility Helper Functions
const {
  validateSignup,
  validateUpdatePassword,
} = require("../utils/validators");
const { verifyToken } = require("../utils/tokenUtils");

// Imported Models
const ResendAttempt = require("./resendAttemptModel");

// Imported Mail
// const sendVerificationEmail = require("../mail/sendVerificationEmail");

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

// Pre Save Hook -------------------------------------------------
userSchema.pre("save", async function (next) {
  try {
    // Hash password before saving
    if (this.isModified("password")) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    // User name formatting
    ["firstName", "middleName", "lastName"].forEach((field) => {
      if (this.isModified(field) && this[field]) {
        this[field] = this[field]
          .trim()
          .toLowerCase()
          .replace(/\b\w/g, (char) => char.toUpperCase()); // Finds every first letter per word then converts it to uppercase
      }
    });

    next(); // Proceed
  } catch (err) {
    next(err); // Pass the error to next middleware
  }
});

// Static Methods ------------------------------------------------------

// Signup Static Method
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

    return await this.create({
      email,
      password,
      firstName,
      lastName,
    }); // Create and return the new user
  } catch (err) {
    throw new Error(err.message);
  }
};

// Verification and Authentication Token Creation Static Method
userSchema.statics.createToken = (content, expiry) =>
  jwt.sign(content, process.env.SECRET, { expiresIn: expiry });

// Verify Email Static Method
userSchema.statics.verifyEmail = async function (token) {
  try {
    // Verify and decode the token
    const decodedToken = verifyToken(token);

    // Find user by id
    const user = await this.findById(decodedToken.userId);

    // Check if user exists
    if (!user) {
      throw new Error("User not found.");
    }

    // Check if verified already
    if (user.isEmailVerified) {
      throw new Error("Email is already verified.");
    }

    // Update isEmailVerified status
    user.isEmailVerified = true;
    await user.save();

    // Return success message
    return { message: "Email verified successfully!" };
  } catch (err) {
    throw new Error(err.message || "Error on verification process.");
  }
};

// Resend Verification Static Method
userSchema.statics.resendVerificationEmail = async function (email) {
  // Find user by email
  const user = await this.findOne({ email });

  // Check if user exists
  if (!user) throw new Error("User not found.");

  if (user.isEmailVerified) throw new Error("Email is already verified.");

  // Check if resend is allowed
  const { allowed, message } = await ResendAttempt.handleResendAttempt(
    user.email,
    "verification"
  );

  if (!allowed) throw new Error(message);

  return { userEmail: user.email, userId: user._id };

  // TODO: RETEST THIS REQUEST
};

// User Login Static Method
userSchema.statics.login = async function (email, password) {
  // Check if user exists
  const user = await this.findOne({ email });
  if (!user) throw new Error("User not found!");

  // Check if password matched
  const isMatch = bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  if (!user.isEmailVerified)
    throw new Error("Account not verified. Please verify your email.");

  // Generate Login Token
  const token = this.createToken({ userId: user._id, email: user.email }, "7d");

  return {
    message: "Login Success",
    token,
  };
};

// Static method for sending a password reset email
userSchema.statics.sendPasswordResetEmail = async function (email) {
  const user = await this.findOne({ email });

  // Check if user exists
  if (!user) throw new Error("User not found.");

  // Check if resend is allowed
  const { allowed, attempts, message } =
    await ResendAttempt.handleResendAttempt(user.email, "password-reset");

  if (!allowed) throw new Error(message);

  return { userEmail: user.email, userId: user._id, sendAttempts: attempts };
};

// Static method for password reset
userSchema.statics.passwordReset = async function (token, newPassword) {
  // Check if strong password
  validateUpdatePassword(newPassword);

  // Verify token
  const decodedToken = verifyToken(token);

  const user = await this.findById(decodedToken.userId);

  // If no user found in token's userId, it is invalid
  if (!user) throw new Error("Invalid or expired token");

  console.log(user.password);

  user.password = newPassword;
  await user.save();

  return { message: "Password has been reset successfully" };
};

module.exports = mongoose.model("User", userSchema);
