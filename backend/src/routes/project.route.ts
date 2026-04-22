import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject
} from "../controllers/project.controller.js";

export default async function projectRoutes(fastify, options) {
  fastify.addHook('preHandler', protectRoute);

  fastify.post("/", createProject);
  fastify.get("/", getProjects);
  fastify.put("/:id", updateProject);
  fastify.delete("/:id", deleteProject);
}