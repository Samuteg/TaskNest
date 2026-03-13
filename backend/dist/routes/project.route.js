import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js"; // Ajuste o caminho conforme o seu projeto
import { createProject, getProjects, updateProject, deleteProject } from "../controllers/project.controller.js";
const router = express.Router();
// Todas as rotas de projetos precisam de autenticação
router.use(protectRoute);
router.post("/", createProject);
router.get("/", getProjects);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
export default router;
