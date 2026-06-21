import type { FastifyPluginAsync } from "fastify";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/task.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const taskRoutes: FastifyPluginAsync = async (fastify, options) => {
  fastify.get("/:projectId", { preHandler: protectRoute }, getTasks);
  fastify.post("/", { preHandler: protectRoute }, createTask);
  fastify.put("/:id", { preHandler: protectRoute }, updateTask);
  fastify.delete("/:id", { preHandler: protectRoute }, deleteTask);
};

export default taskRoutes;