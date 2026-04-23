import type { FastifyRequest } from "fastify";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

declare module "fastify" {
  interface FastifyRequest {
    user?: any;
  }
}

export {};
