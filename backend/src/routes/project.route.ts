import type { FastifyPluginAsync } from "fastify";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.js";

const projectRoutes: FastifyPluginAsync = async (fastify, options) => {
  fastify.addHook("preHandler", protectRoute);

  fastify.post("/", createProject);
  fastify.get("/", getProjects);
  fastify.put("/:id", updateProject);
  fastify.delete("/:id", deleteProject);
};

export default projectRoutes;