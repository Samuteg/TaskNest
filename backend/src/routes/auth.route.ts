import {
  changePassword,
  forgotPassword,
  login,
  logout,
  resetPassword,
  signup,
  uploadProfilePicture,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { uploadProfileImage } from "../middleware/upload.middleware.js";

export default async function authRoutes(fastify, options) {
  fastify.post("/signup", signup);
  fastify.post("/login", login);
  fastify.post("/forgot-password", forgotPassword);
  fastify.post("/reset-password", resetPassword);
  fastify.post("/logout", logout);

  fastify.get("/check", { preHandler: protectRoute }, async (request, reply) => {
    reply.send(request.user);
  });

  fastify.put("/profile", { preHandler: protectRoute }, updateProfile);
  fastify.put("/change-password", { preHandler: protectRoute }, changePassword);
  fastify.post("/profile/upload", { preHandler: [protectRoute, uploadProfileImage] }, uploadProfilePicture);
}
