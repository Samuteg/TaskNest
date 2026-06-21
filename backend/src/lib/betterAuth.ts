import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { ENV } from "./env.js";

const mongoClient = new MongoClient(ENV.MONGO_URI || "mongodb://localhost:27017");
export const mongoDb = mongoClient.db(ENV.MONGO_DB_NAME || "tasknest");
let authDbConnected = false;

const parseTrustedOrigins = () =>
  (ENV.FRONTEND_URL || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

export const auth = betterAuth({
  secret:
    ENV.BETTER_AUTH_SECRET ||
    ENV.JWT_SECRET ||
    "dev_only_change_me_with_32_chars_min",
  baseURL: ENV.BETTER_AUTH_URL || `http://localhost:${ENV.PORT || "5000"}`,
  basePath: "/api/auth/core",
  trustedOrigins: parseTrustedOrigins(),
  database: mongodbAdapter(mongoDb, {
    client: mongoClient,
    usePlural: true,
    transaction: ENV.NODE_ENV === "test" ? false : undefined,
  }),
  user: {
    fields: {
      name: "fullName",
      image: "profilePic",
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    // Simple mock implementation for test environment. In production, integrate an email service.
    sendResetPassword: async ({ user, url, token }, request) => {
      // For now, just log the reset URL.
      console.log('Password reset link for', user.email, ':', url);
    },
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },
});

export const connectAuthDb = async () => {
  if (!authDbConnected) {
    await mongoClient.connect();
    authDbConnected = true;
  }
};
