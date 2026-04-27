import type { FastifyPluginAsync } from "fastify";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createProjectComment,
  getProjectCollaborationFeed,
  markNotificationAsRead,
} from "../controllers/collaboration.controller.js";

const collaborationRoutes: FastifyPluginAsync = async (fastify, options) => {
  fastify.addHook("preHandler", protectRoute);

  fastify.get("/projects/:projectId/feed", getProjectCollaborationFeed);
  fastify.post("/projects/:projectId/comments", createProjectComment);
  fastify.patch("/notifications/:notificationId/read", markNotificationAsRead);
};

export default collaborationRoutes;
