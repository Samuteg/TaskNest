import { appRouter } from "@TaskNest/api/routers/index";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyRateLimit from "@fastify/rate-limit";
import { OpenAPIHandler } from "@orpc/openapi/fastify";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ORPCError, onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fastify";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import Fastify from "fastify";

import { createContext } from "./context";
import { env } from "./env.server";
import { auth } from "./services";

const baseCorsConfig = {
	allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
	credentials: true,
	maxAge: 86_400,
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	origin: env.CORS_ORIGIN,
};

function errorCode(error: unknown): string {
	return error instanceof ORPCError ? error.code : "INTERNAL_SERVER_ERROR";
}

const fastify = Fastify({
	logger: true,
});

// Awaited: @fastify/rate-limit wires routes via an onRoute hook, so it
// must load before any route below is declared — otherwise limits never apply.
await fastify.register(fastifyHelmet, { contentSecurityPolicy: false });
await fastify.register(fastifyRateLimit, { max: 100, timeWindow: "1 minute" });
await fastify.register(fastifyCors, baseCorsConfig);

const rpcHandler = new RPCHandler(appRouter, {
	interceptors: [
		onError((error) => {
			fastify.log.warn({ code: errorCode(error) }, "RPC error");
		}),
	],
});

const apiHandler = new OpenAPIHandler(appRouter, {
	interceptors: [
		onError((error) => {
			fastify.log.warn({ code: errorCode(error) }, "OpenAPI error");
		}),
	],
	plugins: [
		new OpenAPIReferencePlugin({
			schemaConverters: [new ZodToJsonSchemaConverter()],
		}),
	],
});

fastify.register((rpcApp) => {
	// Fully utilize oRPC features by letting oRPC parse the request body.
	rpcApp.addContentTypeParser("*", (_, _payload, done) => {
		done(null, undefined);
	});

	rpcApp.all("/rpc/*", async (request, reply) => {
		const { matched } = await rpcHandler.handle(request, reply, {
			context: await createContext(request.headers),
			prefix: "/rpc",
		});

		if (!matched) {
			reply.status(404).send();
		}
	});

	rpcApp.all("/api-reference/*", async (request, reply) => {
		const { matched } = await apiHandler.handle(request, reply, {
			context: await createContext(request.headers),
			prefix: "/api-reference",
		});

		if (!matched) {
			reply.status(404).send();
		}
	});
});

fastify.route({
	config: {
		rateLimit: { max: 20, timeWindow: "1 minute" },
	},
	async handler(request, reply) {
		try {
			const url = new URL(request.url, `http://${request.headers.host}`);
			const headers = new Headers();
			for (const [key, value] of Object.entries(request.headers)) {
				if (value) {
					headers.append(key, value.toString());
				}
			}
			const req = new Request(url.toString(), {
				body: request.body ? JSON.stringify(request.body) : undefined,
				headers,
				method: request.method,
			});
			const response = await auth.handler(req);
			reply.status(response.status);
			for (const [key, value] of response.headers) {
				reply.header(key, value);
			}
			reply.send(response.body ? await response.text() : null);
		} catch {
			fastify.log.warn({ code: "AUTH_FAILURE" }, "Authentication error");
			reply.status(500).send({
				code: "AUTH_FAILURE",
				error: "Internal authentication error",
			});
		}
	},
	method: ["GET", "POST"],
	url: "/api/auth/*",
});

fastify.get("/", async () => "OK");

fastify.listen({ host: "0.0.0.0", port: 3000 }, (err) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
	console.log("Server running on port 3000");
});
