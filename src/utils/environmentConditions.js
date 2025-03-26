import "dotenv/config";

export const CLIENT_URL =
  process.env.NODE_ENV === "prod"
    ? process.env.CLIENT_URL_PROD
    : process.env.CLIENT_URL_DEV;

export const MONGO_URI =
  process.env.NODE_ENV === "prod"
    ? process.env.MONGO_URI_PROD
    : process.env.MONGO_URI_DEV;
