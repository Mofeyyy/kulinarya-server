import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Imported Utility Functions
import { verifyToken } from "../utils/tokenUtils.js";
import CustomError from "../utils/customError.js";
import { validateObjectId } from "../utils/validators.js";
import handleSupabaseUpload from "../utils/handleSupabaseUpload.js";

// Imported Validation Schema
import {
  registerUserSchema,
  loginUserSchema,
  updateUserSchema,
} from "../validations/userValidations.js";

// Imported Models
import ResendAttempt from "./resendAttemptModel.js";

// TODO: Add Object Id Validations

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
    {
      userId: this._id,
      email: this.email,
      role: this.role,
      firstName: this.firstName,
    },
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

// Signup Static Method
userSchema.statics.signup = async function (signupCredentials) {
  const { email } = signupCredentials;

  // Validate user data
  registerUserSchema.parse(signupCredentials);

  console.log(signupCredentials);

  const isEmailExists = await this.findOne({ email });

  if (isEmailExists) throw new CustomError("Email is already in use!", 400);

  return await this.create(signupCredentials);
};

// Verify Email Static Method
userSchema.statics.verifyEmail = async function (token) {
  // Verify and decode the token
  const decodedToken = verifyToken(token);

  validateObjectId(decodedToken.userId, "User ID");

  const user = await this.findById(decodedToken.userId);

  if (!user) throw new CustomError("User not found", 404);

  if (user.isEmailVerified)
    throw new CustomError("Email is already verified", 400);

  user.isEmailVerified = true;
  await user.save();
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
  const userId = req.user.userId;

  validateObjectId(userId, "User ID");

  const user = await this.findById(userId).select(
    "email firstName middleName lastName role"
  );

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
  updateUserSchema.parse({
    password: newPassword,
  });

  const decodedToken = verifyToken(token);

  validateObjectId(decodedToken.userId, "User ID");

  const user = await this.findById(decodedToken.userId);

  if (!user) throw new CustomError("User not found", 404);

  user.password = newPassword;
  await user.save();
};

// Static method for fetching specific user data
userSchema.statics.getSpecificUserData = async function (req) {
  const { userId } = req.params;

  validateObjectId(userId, "User ID");

  const user = await this.findOne({
    _id: userId,
    deletedAt: { $in: [null, undefined] },
  })
    .select("email firstName middleName lastName profilePictureUrl bio")
    .lean();

  if (!user) throw new CustomError("User not found", 404);

  return user;
};

// Static method for updating user data
// TODO: Test this especially the supabase file upload when implementing on frontend
userSchema.statics.updateUserData = async function (req) {
  const { userId } = req.params;
  const updates = req.body;

  // Supabase File Upload
  if (req.file) {
    updates.profilePictureUrl = await handleSupabaseUpload({
      file: req.file,
      folder: "profile_pictures",
      allowedTypes: ["jpeg", "png"],
      maxFileSize: 2 * 1024 * 1024, // 2mb
    });
  }

  validateObjectId(userId, "User ID");
  updateUserSchema.parse(updates);

  const updatedUser = await this.findOneAndUpdate(
    {
      _id: userId,
      deletedAt: { $in: [null, undefined] },
    },
    updates,
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    const existingUser = await this.findById(userId).select("deletedAt").lean();

    if (!existingUser) throw new CustomError("User not found", 404);

    if (existingUser.deletedAt)
      throw new CustomError("User has been deleted", 403);

    throw new CustomError("Unauthorized", 401);
  }

  return updatedUser;
};

// Static method for soft deleting user account
userSchema.statics.softDeleteUser = async function (req) {
  const { userId } = req.params;
  const userUpdatingId = req.user.userId;
  const userUpdatingRole = req.user.role;

  validateObjectId(userId, "User ID");

  const user = await this.findById(userId).select("deletedAt");

  if (!user) throw new CustomError("User not found", 404);

  if (user.deletedAt) throw new CustomError("User has been deleted", 403);

  const isTheUserUpdatingHimself = userUpdatingId === userId;
  const isTheUserUpdatingAnAdmin = userUpdatingRole === "admin";

  if (isTheUserUpdatingHimself || isTheUserUpdatingAnAdmin)
    throw new CustomError("Unauthorized", 401);

  user.deletedAt = new Date();
  await user.save();
};

// Static method for fetching user recipes
userSchema.statics.getUserRecipes = async function (req) {
  const { userId } = req.params;

  validateObjectId(userId, "User ID");

  const userRecipes = await Recipe.find({
    byUser: userId,
    deletedAt: { $in: [null, undefined] },
  }).lean();

  if (!userRecipes) throw new CustomError("User has no recipes", 404);

  return userRecipes;
};

const User = model("User", userSchema);
export default User;
