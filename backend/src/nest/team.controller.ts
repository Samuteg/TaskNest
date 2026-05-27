import { Controller, Delete, Get, Patch, Post, Req, Res } from "@nestjs/common";
import { cancelTeamInvite, createTeamInvite, listReceivedTeamInvites, listTeamInvites, respondToTeamInvite } from "../controllers/team.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

@Controller("api/team")
export class TeamController {
  @Get("invites") async list(@Req() req: any, @Res() res: any) { await protectRoute(req, res); if (res.sent) return; return listTeamInvites(req, res); }
  @Get("invites/received") async listReceived(@Req() req: any, @Res() res: any) { await protectRoute(req, res); if (res.sent) return; return listReceivedTeamInvites(req, res); }
  @Post("invites") async create(@Req() req: any, @Res() res: any) { await protectRoute(req, res); if (res.sent) return; return createTeamInvite(req, res); }
  @Patch("invites/:id/status") async respond(@Req() req: any, @Res() res: any) { await protectRoute(req, res); if (res.sent) return; return respondToTeamInvite(req, res); }
  @Delete("invites/:id") async cancel(@Req() req: any, @Res() res: any) { await protectRoute(req, res); if (res.sent) return; return cancelTeamInvite(req, res); }
}
