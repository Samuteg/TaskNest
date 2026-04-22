import type { FastifyPluginAsync } from "fastify";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createProjectComment,
  getProjectCollaborationFeed,
  markNotificationAsRead,
} from "../controllers/collaboration.controller.js";
import { adaptExpressHandler } from "../lib/expressAdapter.js";

const collaborationRoutes: FastifyPluginAsync = async (fastify, options) => {
  fastify.addHook("preHandler", protectRoute);

  fastify.get(
    "/projects/:projectId/feed",
    adaptExpressHandler(getProjectCollaborationFeed),
  );
  fastify.post(
    "/projects/:projectId/comments",
    adaptExpressHandler(createProjectComment),
  );
  fastify.patch(
    "/notifications/:notificationId/read",
    adaptExpressHandler(markNotificationAsRead),
  );
};

export default collaborationRoutes;
