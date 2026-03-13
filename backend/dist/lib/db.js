import mongoose from "mongoose";
import { ENV } from "./env.js";
export const connectDB = async () => {
    const { MONGO_URI, MONGO_DB_NAME } = ENV;
    if (!MONGO_URI)
        throw new Error("MONGO_URI is not set");
    const conn = await mongoose.connect(MONGO_URI, {
        dbName: MONGO_DB_NAME || "tasknest",
        serverSelectionTimeoutMS: 10000,
    });
    console.log("MongoDB connected:", conn.connection.host, conn.connection.name);
};
