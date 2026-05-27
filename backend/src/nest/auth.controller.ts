import { Controller, Get, Post, Put, Req, Res } from "@nestjs/common";
import {
  changePassword,
  forgotPassword,
  login,
  logout,
  resetPassword,
  signup,
  updateProfile,
  uploadProfilePicture,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { uploadProfileImage } from "../middleware/upload.middleware.js";

@Controller("api/auth")
export class AuthController {
  @Post("signup") signup(@Req() req: any, @Res() res: any) { return signup(req, res); }
  @Post("login") login(@Req() req: any, @Res() res: any) { return login(req, res); }
  @Post("forgot-password") forgotPassword(@Req() req: any, @Res() res: any) { return forgotPassword(req, res); }
  @Post("reset-password") resetPassword(@Req() req: any, @Res() res: any) { return resetPassword(req, res); }
  @Post("logout") logout(@Req() req: any, @Res() res: any) { return logout(req, res); }

  @Get("check")
  async check(@Req() req: any, @Res() res: any) {
    await protectRoute(req, res);
    if (res.sent) return;
    return res.send(req.user);
  }

  @Put("profile")
  async updateProfile(@Req() req: any, @Res() res: any) {
    await protectRoute(req, res);
    if (res.sent) return;
    return updateProfile(req, res);
  }

  @Put("change-password")
  async changePassword(@Req() req: any, @Res() res: any) {
    await protectRoute(req, res);
    if (res.sent) return;
    return changePassword(req, res);
  }

  @Post("profile/upload")
  async upload(@Req() req: any, @Res() res: any) {
    await protectRoute(req, res);
    if (res.sent) return;
    await uploadProfileImage(req, res);
    if (res.sent) return;
    return uploadProfilePicture(req, res);
  }
}
