import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

type CookieOptions = {
  httpOnly?: boolean;
  sameSite?: boolean | "lax" | "none" | "strict";
  secure?: boolean;
  maxAge?: number;
};

const AUTH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const isHttpsUrl = (value?: string) => {
  if (!value) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

export const getAuthCookieOptions = () => {
  const isProduction = ENV.NODE_ENV === "production";
  const secure = isProduction || isHttpsUrl(ENV.FRONTEND_URL);

  return {
    httpOnly: true,
    sameSite: secure ? "none" : "lax",
    secure,
  };
};

export const generateToken = (userId, reply) => {
  const { JWT_SECRET } = ENV;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  const token = jwt.sign({ userId }, ENV.JWT_SECRET, {
    expiresIn: "7d",
  });

  reply.setCookie("jwt", token, {
    ...getAuthCookieOptions(),
    maxAge: AUTH_COOKIE_MAX_AGE_MS, // 7 days
  });

  return token;
};
