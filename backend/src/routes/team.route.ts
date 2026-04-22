import type { FastifyPluginAsync } from "fastify";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  cancelTeamInvite,
  createTeamInvite,
  listReceivedTeamInvites,
  listTeamInvites,
  respondToTeamInvite,
} from "../controllers/team.controller.js";
import { adaptExpressHandler } from "../lib/expressAdapter.js";

const teamRoutes: FastifyPluginAsync = async (fastify, options) => {
  fastify.addHook("preHandler", protectRoute);

  fastify.get("/invites", adaptExpressHandler(listTeamInvites));
  fastify.get("/invites/received", adaptExpressHandler(listReceivedTeamInvites));
  fastify.post("/invites", adaptExpressHandler(createTeamInvite));
  fastify.patch("/invites/:id/status", adaptExpressHandler(respondToTeamInvite));
  fastify.delete("/invites/:id", adaptExpressHandler(cancelTeamInvite));
};

export default teamRoutes;
