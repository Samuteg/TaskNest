import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import taskRoutes from "./routes/task.route.js";
import projectRoutes from "./routes/project.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [ENV.FRONTEND_URL, "http://localhost:3000"]
  .filter(Boolean)
  .map((url) => url.replace(/\/+$/, ""));

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      const normalizedOrigin = origin ? origin.replace(/\/+$/, "") : origin;

      if (!origin || allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", service: "TaskNest API" });
});

app.listen(PORT, () => {
  console.log("server running on port " + PORT);
  connectDB();
});
