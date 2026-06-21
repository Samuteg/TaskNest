import { Controller, Delete, Get, Post, Put, Req, Res, UseGuards } from "@nestjs/common";
import { createProject, deleteProject, getProjects, updateProject } from "../controllers/project.controller.js";
import { AuthGuard } from "./auth.guard.js";

@Controller("api/projects")
@UseGuards(AuthGuard)
export class ProjectController {
  @Post("/") async create(@Req() req: any, @Res() res: any) { return createProject(req, res); }
  @Get("/") async list(@Req() req: any, @Res() res: any) { return getProjects(req, res); }
  @Put(":id") async update(@Req() req: any, @Res() res: any) { return updateProject(req, res); }
  @Delete(":id") async remove(@Req() req: any, @Res() res: any) { return deleteProject(req, res); }
}
