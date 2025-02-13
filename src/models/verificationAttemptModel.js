const mongoose = require("mongoose");

// Imported Utilities
const {
  checkEmailVerificationResendLimits,
} = require("../utils/emailVerificationUtils");

const verificationAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  attempts: { type: Number, default: 0 },
  lastSent: { type: Date, default: null },
});

// Static method to check if verification email can be resent
verificationAttemptSchema.statics.isVerificationResendAllowed = async function (
  userId
) {
  const now = new Date();

  // Find and update or create a new record if it doesn't exist
  let attemptRecord = await this.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { new: true, upsert: true }
  );

  const { attempts, lastSent } = attemptRecord;

  // Reset attempts if a new day starts
  if (lastSent && lastSent.toDateString() !== now.toDateString()) {
    attemptRecord.attempts = 0;
  }

  const { hasReachedMaxAttempts, isInCooldownPeriod, remainingCooldownTime } =
    checkEmailVerificationResendLimits(attempts, lastSent, now);

  if (hasReachedMaxAttempts) {
    return {
      allowed: false,
      message:
        "Maximum verification attempts reached for today. Try again tomorrow.",
    };
  }

  if (isInCooldownPeriod) {
    return {
      allowed: false,
      message: `Please wait ${remainingCooldownTime} seconds before requesting another verification email.`,
    };
  }

  // Update attempt tracking
  attemptRecord.lastSent = now;
  attemptRecord.attempts += 1;
  await attemptRecord.save();

  return { allowed: true };
};

module.exports = mongoose.model(
  "VerificationAttempt",
  verificationAttemptSchema
);
