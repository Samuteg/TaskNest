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

  fastify.all("/api/auth/core/*", async (request, reply) => {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
    const headers = new Headers();
    for (const [key, value] of Object.entries(request.headers)) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else if (value !== undefined) {
        headers.set(key, value);
      }
    }
    const body =
      request.method !== "GET" && request.method !== "HEAD" && request.body
        ? JSON.stringify(request.body)
        : undefined;

    const req = new Request(url.toString(), {
      method: request.method,
      headers,
      body,
    });

    const response = await auth.handler(req);

    reply.status(response.status);
    response.headers.forEach((value, key) => reply.header(key, value));

    const text = await response.text();
    return reply.send(text || null);
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
