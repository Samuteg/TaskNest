import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { AuthCoreController } from "./auth-core.controller.js";
import { AuthController } from "./auth.controller.js";
import { ProjectController } from "./project.controller.js";
import { TaskController } from "./task.controller.js";
import { TeamController } from "./team.controller.js";
import { CollaborationController } from "./collaboration.controller.js";

@Module({
  controllers: [
    AppController,
    AuthCoreController,
    AuthController,
    ProjectController,
    TaskController,
    TeamController,
    CollaborationController,
  ],
})
export class AppModule {}
