import express from "express";
import { getTasks, createTask, updateTask, deleteTask, } from "../controllers/task.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = express.Router();
router.get("/:projectId", protectRoute, getTasks);
router.post("/", protectRoute, createTask);
router.put("/:id", protectRoute, updateTask);
router.delete("/:id", protectRoute, deleteTask);
export default router;
