import type { FastifyPluginAsync } from "fastify";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  cancelTeamInvite,
  createTeamInvite,
  listReceivedTeamInvites,
  listTeamInvites,
  respondToTeamInvite,
} from "../controllers/team.controller.js";

const teamRoutes: FastifyPluginAsync = async (fastify, options) => {
  fastify.addHook("preHandler", protectRoute);

  fastify.get("/invites", listTeamInvites);
  fastify.get("/invites/received", listReceivedTeamInvites);
  fastify.post("/invites", createTeamInvite);
  fastify.patch("/invites/:id/status", respondToTeamInvite);
  fastify.delete("/invites/:id", cancelTeamInvite);
};

export default teamRoutes;
