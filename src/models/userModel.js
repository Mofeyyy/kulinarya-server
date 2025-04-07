import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";


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
import Recipe from "./recipeModel.js";
import ResetToken from "./resetTokenModel.js";

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
    secure: process.env.NODE_ENV === "prod",
    sameSite: process.env.NODE_ENV === "prod" ? "none" : "lax",
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

  if (!user) throw new CustomError("Email is not registered", 404);

  // TODO: Add bcrypt catch error here
  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) throw new CustomError("Wrong Password!", 400);

  return user;
};

// Getting Auth User Details Static Method
userSchema.statics.getAuthUserDetails = async function (req) {
  const userId = req.user.userId;

  validateObjectId(userId, "User ID");

  const user = await this.findById(userId).select(
    "email firstName middleName lastName role profilePictureUrl"
  );

  if (!user) throw new CustomError("User not found", 404);

  return user;
};

// Static method for sending a password reset email
userSchema.statics.sendPasswordResetEmail = async function (email) {
  const user = await this.findOne({ email });
  if (!user) throw new CustomError("User not found", 404);

  const { allowed, attempts, message } = await ResendAttempt.handleResendAttempt(user.email, "passwordReset");
  if (!allowed) throw new CustomError(message, 400);

  // Generate new token
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  // Save to DB
  await ResetToken.create({
    userId: user._id,
    token,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
  });

  return { user, sendAttempts: attempts, token }; // optionally return token for testing
};

// Static method for password reset
userSchema.statics.verifyResetToken = async function (token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const resetEntry = await ResetToken.findOne({ token });
    if (!resetEntry || resetEntry.used || resetEntry.expiresAt < new Date()) {
      throw new CustomError("Invalid, expired, or already used token", 400);
    }

    return decoded;
  } catch (err) {
    throw new CustomError("Invalid or expired token", 400);
  }
};



userSchema.statics.passwordReset = async function (token, newPassword) {
  const decoded = await this.verifyResetToken(token);

  const user = await this.findById(decoded.userId);
  if (!user) throw new CustomError("User not found", 404);

  // Update password
  user.password = newPassword; // plain text
  await user.save();

  // Mark token as used
  await ResetToken.findOneAndUpdate({ token }, { used: true });

  return user;
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

  // Check if the user being deleted is an admin
  const userToDelete = await this.findById(userId).select("role");
  if (!userToDelete) throw new CustomError("User not found", 404);

  const isTheUserToDeleteAnAdmin = userToDelete.role === "admin";

  if (isTheUserUpdatingHimself || isTheUserToDeleteAnAdmin)
    throw new CustomError("Unauthorized", 401);

  user.deletedAt = new Date();
  await user.save();
};

// Static method for fetching user recipes
// Static method for fetching user recipes with pagination
userSchema.statics.getUserRecipesList = async function (req) {
  const { userId } = req.params;
  const {
    search,
    origin,
    category,
    sortOrder = "newest",
    page = 1,
    limit = 10,
  } = req.query;

  validateObjectId(userId, "User ID");

  // Calculate skip value for pagination
  const skip = (page - 1) * limit;

  // **Build Query Object**
  const query = {
    byUser: userId,
    deletedAt: { $in: [null, undefined] }, // Exclude soft-deleted recipes
  };

  // **Apply Search Filter**
  if (search?.trim()) {
    query.$or = [
      { title: { $regex: search.trim(), $options: "i" } },
      { description: { $regex: search.trim(), $options: "i" } },
    ];
  }

  if (category) {
    query.foodCategory = { $regex: category, $options: "i" };
  }

  if (origin) {
    query.originProvince = { $regex: origin, $options: "i" };
  }

  console.log("🔍 Backend Query:", JSON.stringify(query, null, 2)); // ✅ Debugging

  // **Set Sorting Order**
  const sortOption =
    sortOrder === "newest" ? { createdAt: -1 } : { createdAt: 1 };

  // **Fetch Filtered Recipes**
  const userRecipes = await Recipe.find(query)
    .populate("byUser", "firstName lastName") // Populate User fields
    .sort(sortOption) // Apply sorting
    .skip(skip) // Skip for pagination
    .limit(Number(limit)) // Limit number of recipes per page
    .lean();

  // **Count Total Recipes**
  const totalRecipes = await Recipe.countDocuments(query);

  // **Return Data**
  return {
    userRecipes,
    totalRecipes,
  };
};

userSchema.statics.initialLogin = async function () {
  console.log("Running initial login...");

  const adminExists = await this.findOne({ role: "admin" }).lean();

  if (!adminExists) {
    await this.create({
      email: process.env.INITIAL_ADMIN_EMAIL,
      password: process.env.INITIAL_ADMIN_PASSWORD,
      firstName: "Kulinarya",
      lastName: "Admin",
      role: "admin",
      isEmailVerified: true,
    });

    console.log("Initial Login Success!");

    return { message: "Initial Login Success!" };
  }
};

userSchema.statics.getTopSharers = async function () {
  const topSharers = await this.aggregate([
    {
      $match: {
        $or: [{ deletedAt: null }, { deletedAt: { $in: [null, undefined] } }],
      }, // Exclude deleted users
    },

    {
      $lookup: {
        from: "recipes",
        localField: "_id",
        foreignField: "byUser",
        as: "recipes",
      },
    },

    {
      $unwind: "$recipes", // Flatten recipes array
    },

    {
      $lookup: {
        from: "moderations",
        localField: "recipes._id",
        foreignField: "forPost",
        as: "moderationInfo",
      },
    },

    {
      $unwind: "$moderationInfo", // Flatten moderations array
    },

    {
      $match: {
        "moderationInfo.status": "approved", // Ensure only approved recipes count
      },
    },

    {
      $group: {
        _id: "$_id",
        firstName: { $first: "$firstName" },
        lastName: { $first: "$lastName" },
        profilePictureUrl: { $first: "$profilePictureUrl" },
        totalRecipes: { $sum: 1 }, // Count approved recipes
      },
    },

    {
      $match: { totalRecipes: { $gt: 0 } }, // Only users with at least 1 approved recipe
    },

    {
      $sort: { totalRecipes: -1 }, // Sort by most approved recipes
    },

    {
      $limit: 5, // Limit to top 5 sharers
    },

    {
      $project: {
        firstName: 1,
        lastName: 1,
        profilePictureUrl: 1,
        totalRecipes: 1,
      },
    },
  ]);

  return topSharers;
};

userSchema.statics.getAllUsers = async function () {
  const users = await this.find({ deletedAt: { $in: [null, undefined] } })
    .select("firstName lastName email role createdAt")
    .lean();

  return users;
};

const User = model("User", userSchema);
export default User;
