import express from "express";
import {
  forgotPassword,
  login,
  logout,
  signup,
  uploadProfilePicture,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { uploadProfileImage } from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/logout", logout);

router.get("/check", protectRoute, (req, res) => {
  res.status(200).json(req.user);
});

router.put("/profile", protectRoute, updateProfile);
router.post("/profile/upload", protectRoute, uploadProfileImage, uploadProfilePicture);

export default router;
