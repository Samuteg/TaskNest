import { Controller, Delete, Get, Post, Put, Req, Res } from "@nestjs/common";
import { createProject, deleteProject, getProjects, updateProject } from "../controllers/project.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

@Controller("api/projects")
export class ProjectController {
  @Post("/") async create(@Req() req: any, @Res() res: any) { await protectRoute(req, res); if (res.sent) return; return createProject(req, res); }
  @Get("/") async list(@Req() req: any, @Res() res: any) { await protectRoute(req, res); if (res.sent) return; return getProjects(req, res); }
  @Put(":id") async update(@Req() req: any, @Res() res: any) { await protectRoute(req, res); if (res.sent) return; return updateProject(req, res); }
  @Delete(":id") async remove(@Req() req: any, @Res() res: any) { await protectRoute(req, res); if (res.sent) return; return deleteProject(req, res); }
}
