import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import multipart from "@fastify/multipart";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import apiReference from "@scalar/fastify-api-reference";
import { AppModule } from "./nest/app.module.js";
import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { auth, connectAuthDb } from "./lib/betterAuth.js";
import { createCorsOriginChecker } from "./lib/cors.js";
import "./models/User.ts";
import "./models/Task.ts";
import "./models/project.model.ts";
import "./models/teamInvite.model.ts";
import "./models/collaborationEvent.model.ts";

const PORT = Number(process.env.PORT || 5000);

async function bootstrap() {
  const adapter = new FastifyAdapter();
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, {
    bodyParser: true,
  });

  const fastify = app.getHttpAdapter().getInstance();

  await fastify.register(cors, {
    origin: createCorsOriginChecker(),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  });

  await fastify.register(cookie);
  await fastify.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } });
  await fastify.register(swagger, {
    openapi: {
      info: { title: "TaskNest API", version: "2.0.0" },
      servers: [{ url: "/" }],
    },
  });
  await fastify.register(swaggerUi, { routePrefix: "/docs/swagger" });
  await fastify.register(apiReference, {
    routePrefix: "/docs",
    configuration: { spec: { url: "/docs/swagger/json" } },
  });

  await connectDB();
  await connectAuthDb();
  await app.listen(PORT, "0.0.0.0");
  console.log("server running on port " + PORT);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
