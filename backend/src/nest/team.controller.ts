import { Controller, Delete, Get, Patch, Post, Req, Res, UseGuards } from "@nestjs/common";
import { cancelTeamInvite, createTeamInvite, listReceivedTeamInvites, listTeamInvites, respondToTeamInvite } from "../controllers/team.controller.js";
import { AuthGuard } from "./auth.guard.js";

@Controller("api/team")
@UseGuards(AuthGuard)
export class TeamController {
  @Get("invites") async list(@Req() req: any, @Res() res: any) { return listTeamInvites(req, res); }
  @Get("invites/received") async listReceived(@Req() req: any, @Res() res: any) { return listReceivedTeamInvites(req, res); }
  @Post("invites") async create(@Req() req: any, @Res() res: any) { return createTeamInvite(req, res); }
  @Patch("invites/:id/status") async respond(@Req() req: any, @Res() res: any) { return respondToTeamInvite(req, res); }
  @Delete("invites/:id") async cancel(@Req() req: any, @Res() res: any) { return cancelTeamInvite(req, res); }
}
