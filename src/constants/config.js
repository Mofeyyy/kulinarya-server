// Check if the web application is in production (live)
const isAppInProduction = process.env.NODE_ENV === "production";

// Seven days in milliseconds
const sevenDays = 7 * 24 * 60 * 60 * 1000;

module.exports = { isAppInProduction, sevenDays };
