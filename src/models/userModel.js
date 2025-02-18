import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Imported Utility Functions
import { verifyToken } from "../utils/tokenUtils.js";
import CustomError from "../utils/customError.js";

// Imported Validation Schema
import {
  registerUserSchema,
  loginUserSchema,
} from "../validations/userValidations.js";

// Imported Models
import ResendAttempt from "./resendAttemptModel.js";

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
          .replace(/\b\w/g, (char) => char.toUpperCase());
      }
    });

    next();
  } catch (err) {
    next(err);
  }
});

// Generate Auth Token Method
userSchema.methods.generateAuthToken = function (res) {
  const token = jwt.sign(
    { userId: this._id, email: this.email, role: this.role, },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("kulinarya_auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Generate Verification and Forgot Password Token Method
userSchema.methods.generateToken = function (type) {
  const expiresIn = type === "emailVerification" ? "1h" : "15m";

  return jwt.sign(
    { userId: this._id, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

// TODO: Retest this method
// Signup Static Method
userSchema.statics.signup = async function (
  email,
  password,
  firstName,
  lastName
) {
  // Validate user data
  registerUserSchema.parse({
    email,
    password,
    firstName,
    lastName,
  });

  const isEmailExists = await this.findOne({ email });

  if (isEmailExists) throw new CustomError("Email is already in use!", 400);

  return await this.create({
    email,
    password,
    firstName,
    lastName,
  });
};

// Verify Email Static Method
userSchema.statics.verifyEmail = async function (token) {
  // Verify and decode the token
  const decodedToken = verifyToken(token);

  const user = await this.findById(decodedToken.userId);

  if (!user) throw new CustomError("User not found", 404);

  if (user.isEmailVerified)
    throw new CustomError("Email is already verified", 400);

  user.isEmailVerified = true;
  await user.save();

  return { message: "Email verified successfully!" };
};

// Resend Verification Static Method
userSchema.statics.resendVerificationEmail = async function (email) {
  const user = await this.findOne({ email });

  if (!user) throw new CustomError("User not found", 404);

  if (user.isEmailVerified)
    throw new CustomError("Email is already verified", 400);

  // Check if resend is allowed
  const { allowed, message } = await ResendAttempt.handleResendAttempt(
    user.email,
    "verification"
  );

  if (!allowed) throw new CustomError(message, 400);

  return user;
};

// User Login Static Method
userSchema.statics.login = async function (email, password) {
  // Validate user data
  loginUserSchema.parse({
    email,
    password,
  });

  const user = await this.findOne({ email });

  if (!user) throw new CustomError("User not found", 404);

  // TODO: Add bcrypt catch error here
  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) throw new CustomError("Password is incorrect", 400);

  return user;
};

// Getting Auth User Details Static Method
userSchema.statics.getAuthUserDetails = async function (req) {
  const user = await this.findById(req.user.userId).select(
    "email firstName middleName lastName role"
  ); // Fetch necessary fields

  if (!user) throw new CustomError("User not found", 404);

  return user;
};

// Static method for sending a password reset email
userSchema.statics.sendPasswordResetEmail = async function (email) {
  const user = await this.findOne({ email });

  if (!user) throw new CustomError("User not found", 404);

  // Check if resend is allowed
  const { allowed, attempts, message } =
    await ResendAttempt.handleResendAttempt(user.email, "passwordReset");

  if (!allowed) throw new CustomError(message, 400);

  return { user, sendAttempts: attempts };
};

// Static method for password reset
userSchema.statics.passwordReset = async function (token, newPassword) {
  // Validate user data
  userValidationSchema.parse({
    mode: "update",
    password: newPassword,
  });

  const decodedToken = verifyToken(token);

  const user = await this.findById(decodedToken.userId);

  user.password = newPassword;
  await user.save();

  return { message: "Password has been reset successfully" };
};

const User = model("User", userSchema);
export default User;
