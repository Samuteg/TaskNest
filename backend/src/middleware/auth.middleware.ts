import jwt, { type JwtPayload } from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

export const protectRoute = async (request, reply) => {
  try {
    const token = request.cookies.jwt;
    if (!token) {
      reply.code(401).send({ message: "Unauthorized - No token provided" });
      return;
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload & {
      userId: string;
    };
    if (!decoded) {
      reply.code(401).send({ message: "Unauthorized - Invalid token" });
      return;
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      reply.code(404).send({ message: "User not found" });
      return;
    }

    request.user = user;
  } catch (error) {
    console.log("Error in protectRoute middleware:", error);
    reply.code(500).send({ message: "Internal server error" });
  }
};
