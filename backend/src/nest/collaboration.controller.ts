import { Controller, Get, Patch, Post, Req, Res, UseGuards } from "@nestjs/common";
import { createProjectComment, getProjectCollaborationFeed, markNotificationAsRead } from "../controllers/collaboration.controller.js";
import { AuthGuard } from "./auth.guard.js";

@Controller("api/collaboration")
@UseGuards(AuthGuard)
export class CollaborationController {
  @Get("projects/:projectId/feed") async feed(@Req() req: any, @Res() res: any) { return getProjectCollaborationFeed(req, res); }
  @Post("projects/:projectId/comments") async createComment(@Req() req: any, @Res() res: any) { return createProjectComment(req, res); }
  @Patch("notifications/:notificationId/read") async markRead(@Req() req: any, @Res() res: any) { return markNotificationAsRead(req, res); }
}
