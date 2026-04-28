import type { FastifyReply, FastifyRequest } from "fastify";

export type ExpressLikeRequest = {
  body: any;
  params: any;
  query: any;
  cookies: any;
  headers: any;
  user?: any;
  [key: string]: any;
};

export type ExpressLikeResponse = {
  status: (code: number) => ExpressLikeResponse;
  json: (payload: any) => void;
  send: (payload: any) => void;
};

export const adaptExpressHandler = (handler: (req: ExpressLikeRequest, res: ExpressLikeResponse) => any) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const req: ExpressLikeRequest = {
      ...request,
      body: request.body,
      params: request.params,
      query: request.query,
      cookies: request.cookies,
      headers: request.headers,
      user: (request as any).user,
    };

    let statusCode = 200;
    const res: ExpressLikeResponse = {
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: (payload: any) => {
        reply.code(statusCode).send(payload);
      },
      send: (payload: any) => {
        reply.code(statusCode).send(payload);
      },
    };

    try {
      const result = handler(req, res);
      if (result && typeof result.then === "function") {
        await result;
      }
    } catch (error) {
      reply.code(500).send({ message: "Internal server error" });
    }
  };
};
