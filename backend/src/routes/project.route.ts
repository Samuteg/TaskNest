import type { FastifyPluginAsync } from "fastify";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.js";
import { adaptExpressHandler } from "../lib/expressAdapter.js";

const projectRoutes: FastifyPluginAsync = async (fastify, options) => {
  fastify.addHook("preHandler", protectRoute);

  fastify.post("/", adaptExpressHandler(createProject));
  fastify.get("/", adaptExpressHandler(getProjects));
  fastify.put("/:id", adaptExpressHandler(updateProject));
  fastify.delete("/:id", adaptExpressHandler(deleteProject));
};

export default projectRoutes;