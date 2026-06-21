import { Controller, Get, HttpCode, Post, Put, Req, Res, UseGuards } from "@nestjs/common";
import {
  changePassword,
  forgotPassword,
  resetPassword,
  updateProfile,
  uploadProfilePicture,
} from "../controllers/auth.controller.js";
import { uploadProfileImage } from "../middleware/upload.middleware.js";
import { AuthGuard } from "./auth.guard.js";

@Controller("api/auth")
export class AuthController {
  @Post("forgot-password")
  @HttpCode(200)
  forgot(@Req() req: any, @Res() res: any) {
    return forgotPassword(req, res);
  }

  @Post("reset-password")
  @HttpCode(200)
  reset(@Req() req: any, @Res() res: any) {
    return resetPassword(req, res);
  }

  @Get("check")
  @UseGuards(AuthGuard)
  check(@Req() req: any, @Res() res: any) {
    return res.send(req.user);
  }

  @Put("profile")
  @UseGuards(AuthGuard)
  update(@Req() req: any, @Res() res: any) {
    return updateProfile(req, res);
  }

  @Put("change-password")
  @UseGuards(AuthGuard)
  change(@Req() req: any, @Res() res: any) {
    return changePassword(req, res);
  }

  @Post("profile/upload")
  @UseGuards(AuthGuard)
  async upload(@Req() req: any, @Res() res: any) {
    await uploadProfileImage(req, res);
    if (res.sent) return;
    return uploadProfilePicture(req, res);
  }
}
