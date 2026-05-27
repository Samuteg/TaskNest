import fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import multipart from "@fastify/multipart";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import apiReference from "@scalar/fastify-api-reference";
import authRoutes from "./routes/auth.route.js";
import taskRoutes from "./routes/task.route.js";
import projectRoutes from "./routes/project.route.js";
import teamRoutes from "./routes/team.route.js";
import collaborationRoutes from "./routes/collaboration.route.js";
import { createCorsOriginChecker } from "./lib/cors.js";

const createApp = async () => {
  const app = fastify();
  await app.register(cors, {
    origin: createCorsOriginChecker(),
    credentials: true,
  });

  await app.register(cookie);
  await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } });
  await app.register(swagger, {
    openapi: {
      info: {
        title: "TaskNest API",
        version: "2.0.0",
      },
      servers: [{ url: "/" }],
    },
  });
  await app.register(swaggerUi, {
    routePrefix: "/docs/swagger",
  });

  app.register(authRoutes, { prefix: "/api/auth" });
  app.register(taskRoutes, { prefix: "/api/tasks" });
  app.register(projectRoutes, { prefix: "/api/projects" });
  app.register(teamRoutes, { prefix: "/api/team" });
  app.register(collaborationRoutes, { prefix: "/api/collaboration" });
  await app.register(apiReference, {
    routePrefix: "/docs",
    configuration: {
      spec: {
        url: "/docs/swagger/json",
      },
    },
  });

  app.get("/", async (request, reply) => {
    reply.status(200).send({ status: "ok", service: "TaskNest API" });
  });
  return app;
};

export default createApp;
