import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createProjectComment, getProjectCollaborationFeed, markNotificationAsRead, } from "../controllers/collaboration.controller.js";
const router = express.Router();
router.use(protectRoute);
router.get("/projects/:projectId/feed", getProjectCollaborationFeed);
router.post("/projects/:projectId/comments", createProjectComment);
router.patch("/notifications/:notificationId/read", markNotificationAsRead);
export default router;
