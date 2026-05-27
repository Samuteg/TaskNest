import { Controller, Get, Req, Res } from "@nestjs/common";

@Controller()
export class AppController {
  @Get("/")
  root(@Req() _req: any, @Res() reply: any) {
    return reply.status(200).send({ status: "ok", service: "TaskNest API" });
  }
}
