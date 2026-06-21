import { Controller, Delete, Get, Post, Put, Req, Res, UseGuards } from "@nestjs/common";
import { createTask, deleteTask, getTasks, updateTask } from "../controllers/task.controller.js";
import { AuthGuard } from "./auth.guard.js";

@Controller("api/tasks")
@UseGuards(AuthGuard)
export class TaskController {
  @Get(":projectId") async list(@Req() req: any, @Res() res: any) { return getTasks(req, res); }
  @Post("/") async create(@Req() req: any, @Res() res: any) { return createTask(req, res); }
  @Put(":id") async update(@Req() req: any, @Res() res: any) { return updateTask(req, res); }
  @Delete(":id") async remove(@Req() req: any, @Res() res: any) { return deleteTask(req, res); }
}
