import { Schema, model } from "mongoose";


// Imported Utilities
import { checkResendAttemptLimits } from "../utils/resendAttemptUtils.js";

const resendAttemptSchema = new Schema({
  email: { type: String, required: true },
  type: {
    type: String,
    enum: ["verification", "passwordReset"],
    required: true,
  },
  attempts: { type: Number, default: 0 },
  lastAttempt: { type: Date, default: null },
});

// Static method to handle resend logic
resendAttemptSchema.statics.handleResendAttempt = async function (email, type) {
  const now = new Date();

  // Find and update or create a new record if it doesn't exist
  let attemptRecord = await this.findOneAndUpdate(
    { email, type },
    { $setOnInsert: { email, type } },
    { new: true, upsert: true }
  );

  // Reset attempts if a new day starts
  if (
    attemptRecord.lastAttempt &&
    attemptRecord.lastAttempt.toDateString() !== now.toDateString()
  ) {
    attemptRecord.attempts = 0;
  }

  const { hasReachedMaxAttempts, isInCooldownPeriod, remainingCooldownTime } =
    checkResendAttemptLimits(
      attemptRecord.attempts,
      attemptRecord.lastAttempt,
      now
    );

  if (hasReachedMaxAttempts) {
    return {
      allowed: false,
      message: `Maximum ${type} attempts reached for today. Try again tomorrow.`,
    };
  }

  if (isInCooldownPeriod) {
    return {
      allowed: false,
      message: `Please wait ${remainingCooldownTime} seconds before requesting another ${
        type === "verification"
          ? "verification"
          : type === "passwordReset"
          ? "password reset"
          : ""
      } email.`,
    };
  }

  // Update resend attempt record
  attemptRecord.lastAttempt = now;
  attemptRecord.attempts += 1;
  await attemptRecord.save();

  return { allowed: true, attempts: attemptRecord.attempts };
};

const ResendAttempt = model("ResendAttempt", resendAttemptSchema);
export default ResendAttempt;