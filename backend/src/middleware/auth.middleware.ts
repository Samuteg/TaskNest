import { fromNodeHeaders } from "better-auth/node";
import User from "../models/User.js";
import { auth } from "../lib/betterAuth.js";

export const protectRoute = async (request, reply) => {
  try {
    const session = await (auth as any).api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session?.user?.email) {
      reply.code(401).send({ message: "Unauthorized - No valid session" });
      return;
    }

    const user = await User.findOne({
      email: String(session.user.email).toLowerCase(),
    }).select("-password");

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
