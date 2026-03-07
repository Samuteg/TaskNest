import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createTeamInvite,
  listTeamInvites,
} from "../controllers/team.controller.js";

const router = express.Router();

router.use(protectRoute);
router.get("/invites", listTeamInvites);
router.post("/invites", createTeamInvite);

export default router;
