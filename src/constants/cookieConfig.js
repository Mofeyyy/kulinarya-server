const { isAppInProduction, sevenDays } = require("./config");

const cookieOptions = {
  httpOnly: true, // Prevents JavaScript access (XSS protection)
  secure: isAppInProduction, // Use secure cookies in production
  sameSite: "strict", // Prevents CSRF attacks
  maxAge: sevenDays, // Set cookie expiration time
};

module.exports = cookieOptions;
