// Imported Constants
const {
  RESEND_VERIFICATION_LIMIT,
  RESEND_VERIFICATION_MAX_ATTEMPTS,
} = require("../constants/limits");

const checkEmailVerificationResendLimits = (attempts, lastSent, now) => {
  const hasReachedMaxAttempts = attempts >= RESEND_VERIFICATION_MAX_ATTEMPTS;

  const isInCooldownPeriod =
    lastSent && now - lastSent < RESEND_VERIFICATION_LIMIT;

  const remainingCooldownTime = isInCooldownPeriod
    ? Math.ceil((RESEND_VERIFICATION_LIMIT - (now - lastSent)) / 1000)
    : 0;

  return {
    hasReachedMaxAttempts,
    isInCooldownPeriod,
    remainingCooldownTime,
  };
};

module.exports = { checkEmailVerificationResendLimits };
