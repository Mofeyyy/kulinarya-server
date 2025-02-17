// Imported Constants
import {
  RESEND_ATTEMPT_LIMIT,
  RESEND_ATTEMPT_MAX_ATTEMPTS,
} from "../constants/limits.js";

export const checkResendAttemptLimits = (attempts, lastAttempt, now) => {
  const hasReachedMaxAttempts = attempts >= RESEND_ATTEMPT_MAX_ATTEMPTS;

  const isInCooldownPeriod =
    lastAttempt && now - lastAttempt < RESEND_ATTEMPT_LIMIT;

  const remainingCooldownTime = isInCooldownPeriod
    ? Math.ceil((RESEND_ATTEMPT_LIMIT - (now - lastAttempt)) / 1000)
    : 0;

  return {
    hasReachedMaxAttempts,
    isInCooldownPeriod,
    remainingCooldownTime,
  };
};