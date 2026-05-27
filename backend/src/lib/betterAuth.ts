import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { ENV } from "./env.js";

const mongoClient = new MongoClient(ENV.MONGO_URI || "mongodb://localhost:27017");
const mongoDb = mongoClient.db(ENV.MONGO_DB_NAME || "tasknest");
let authDbConnected = false;

export const auth = betterAuth({
  secret:
    ENV.BETTER_AUTH_SECRET ||
    ENV.JWT_SECRET ||
    "dev_only_change_me_with_32_chars_min",
  baseURL: ENV.BETTER_AUTH_URL || `http://localhost:${ENV.PORT || "5000"}`,
  basePath: "/api/auth/core",
  database: mongodbAdapter(mongoDb, { client: mongoClient }),
  emailAndPassword: {
    enabled: true,
  },
});

export const connectAuthDb = async () => {
  if (!authDbConnected) {
    await mongoClient.connect();
    authDbConnected = true;
  }
};
