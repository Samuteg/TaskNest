import express from "express";
import {
  login,
  logout,
  signup,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from '../lib/multer.js';
import User from "../models/User.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/check", protectRoute, (req, res) => {
  res.status(200).json(req.user);
});

router.get('/profile', protectRoute, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(user);
});

router.put('/profile', protectRoute, upload.single('avatar'), updateProfile);

export default router;