import { Controller, Delete, Get, Post, Put, Req, Res } from "@nestjs/common";
import { createTask, deleteTask, getTasks, updateTask } from "../controllers/task.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

@Controller("api/tasks")
export class TaskController {
  @Get(":projectId") async list(@Req() req: any, @Res() res: any) { await protectRoute(req, res); if (res.sent) return; return getTasks(req, res); }
  @Post("/") async create(@Req() req: any, @Res() res: any) { await protectRoute(req, res); if (res.sent) return; return createTask(req, res); }
  @Put(":id") async update(@Req() req: any, @Res() res: any) { await protectRoute(req, res); if (res.sent) return; return updateTask(req, res); }
  @Delete(":id") async remove(@Req() req: any, @Res() res: any) { await protectRoute(req, res); if (res.sent) return; return deleteTask(req, res); }
}
