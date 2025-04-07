import { Schema, model } from "mongoose";
import mongoose from "mongoose";
import CustomError from "../utils/customError.js";

const resetTokenSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
});

const ResetToken = model("ResetToken", resetTokenSchema);
export default ResetToken;
