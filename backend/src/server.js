import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import taskRoutes from "./routes/task.route.js";
import projectRoutes from "./routes/project.route.js";
import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000", // A URL exata do seu Next.js
    credentials: true, // Essencial para enviar cookies/tokens de autenticação
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
