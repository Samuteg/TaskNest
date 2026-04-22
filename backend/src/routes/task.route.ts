import type { FastifyPluginAsync } from "fastify";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/task.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { adaptExpressHandler } from "../lib/expressAdapter.js";

const taskRoutes: FastifyPluginAsync = async (fastify, options) => {
  fastify.get("/:projectId", { preHandler: protectRoute }, adaptExpressHandler(getTasks));
  fastify.post("/", { preHandler: protectRoute }, adaptExpressHandler(createTask));
  fastify.put("/:id", { preHandler: protectRoute }, adaptExpressHandler(updateTask));
  fastify.delete("/:id", { preHandler: protectRoute }, adaptExpressHandler(deleteTask));
};

export default taskRoutes;