const RESEND_ATTEMPT_LIMIT = 5 * 60 * 1000; // 5 minutes cooldown
const RESEND_ATTEMPT_MAX_ATTEMPTS = 3; // 3 attempts per day

module.exports = {
  RESEND_ATTEMPT_LIMIT,
  RESEND_ATTEMPT_MAX_ATTEMPTS,
};
