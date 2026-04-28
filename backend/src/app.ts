import fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import multipart from "@fastify/multipart";
import authRoutes from "./routes/auth.route.js";
import taskRoutes from "./routes/task.route.js";
import projectRoutes from "./routes/project.route.js";
import teamRoutes from "./routes/team.route.js";
import collaborationRoutes from "./routes/collaboration.route.js";
import { ENV } from "./lib/env.js";

const createApp = async () => {
  const app = fastify();
  const allowedOrigins = [ENV.FRONTEND_URL, "http://localhost:3000"]
    .filter(Boolean)
    .map((url) => url.replace(/\/+$/, ""));

  await app.register(cors, {
    origin: (origin, callback) => {
      const normalizedOrigin = origin ? origin.replace(/\/+$/, "") : origin;

      if (!origin || allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  });

  await app.register(cookie);
  await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } });

  app.register(authRoutes, { prefix: "/api/auth" });
  app.register(taskRoutes, { prefix: "/api/tasks" });
  app.register(projectRoutes, { prefix: "/api/projects" });
  app.register(teamRoutes, { prefix: "/api/team" });
  app.register(collaborationRoutes, { prefix: "/api/collaboration" });

  app.get("/", async (request, reply) => {
    reply.status(200).send({ status: "ok", service: "TaskNest API" });
  });

  return app;
};

export default createApp;
