import { Controller, Get, Patch, Post, Req, Res } from "@nestjs/common";
import { createProjectComment, getProjectCollaborationFeed, markNotificationAsRead } from "../controllers/collaboration.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

@Controller("api/collaboration")
export class CollaborationController {
  @Get("projects/:projectId/feed") async feed(@Req() req: any, @Res() res: any) { await protectRoute(req, res); if (res.sent) return; return getProjectCollaborationFeed(req, res); }
  @Post("projects/:projectId/comments") async createComment(@Req() req: any, @Res() res: any) { await protectRoute(req, res); if (res.sent) return; return createProjectComment(req, res); }
  @Patch("notifications/:notificationId/read") async markRead(@Req() req: any, @Res() res: any) { await protectRoute(req, res); if (res.sent) return; return markNotificationAsRead(req, res); }
}
