import { All, Controller, HttpCode, Req, Res } from "@nestjs/common";
import { auth } from "../lib/betterAuth.js";

@Controller("api/auth/core")
export class AuthCoreController {
  @All("*")
  @HttpCode(200)
  async coreHandler(@Req() req: any, @Res() res: any) {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v as string));
      } else if (value !== undefined) {
        headers.set(key, value as string);
      }
    }
    const body =
      req.method !== "GET" && req.method !== "HEAD" && req.body
        ? JSON.stringify(req.body)
        : undefined;

    const webReq = new Request(url.toString(), {
      method: req.method,
      headers,
      body,
    });

    const response = await auth.handler(webReq);
    res.status(response.status);
    response.headers.forEach((value: string, key: string) => res.header(key, value));
    const text = await response.text();
    return res.send(text || null);
  }
}
