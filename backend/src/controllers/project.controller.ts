import Project from "../models/project.model.js";
import Task from "../models/Task.js"; // Precisamos importar o Task para apagar as tarefas associadas
import TeamInvite from "../models/teamInvite.model.js";
import mongoose from "mongoose";
import {
  canUserAccessProjectWithRole,
  getAccessibleProjectIds,
  getProjectAccessMapForUser,
} from "../lib/teamAccess.js";

// 1. CRIAR UM PROJETO
export const createProject = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "O nome do projeto é obrigatório." });
    }

    // req.user vem do seu middleware de autenticação (protectRoute)
    const newProject = new Project({
      name,
      user: req.user._id, 
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    console.error("Erro em createProject:", error.message);
    res.status(500).json({ message: "Erro interno ao criar projeto." });
  }
};

// 2. LISTAR TODOS OS PROJETOS DO USUÁRIO
export const getProjects = async (req, res) => {
  try {
    const [accessibleProjectIds, accessByProjectId] = await Promise.all([
      getAccessibleProjectIds(req.user),
      getProjectAccessMapForUser(req.user),
    ]);

    if (!accessibleProjectIds.length) {
      return res.status(200).json([]);
    }

    const projects = await Project.find({
      _id: { $in: accessibleProjectIds },
    }).sort({ createdAt: -1 });

    const projectsWithAccess = projects.map((project) => {
      const access = accessByProjectId.get(project._id.toString()) || {
        role: "viewer",
        isOwner: false,
      };

      return {
        ...project.toObject(),
        accessRole: access.role,
        isOwner: access.isOwner,
      };
    });

    res.status(200).json(projectsWithAccess);
  } catch (error) {
    console.error("Erro em getProjects:", error.message);
    res.status(500).json({ message: "Erro interno ao buscar projetos." });
  }
};

// 3. EDITAR O NOME DO PROJETO
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const normalizedName = String(req.body?.name || "").trim();

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Projeto inválido." });
    }

    if (!normalizedName) {
      return res.status(400).json({ message: "O nome do projeto é obrigatório." });
    }

    const { allowed, project: existingProject } = await canUserAccessProjectWithRole(
      req.user,
      id,
      "admin",
    );

    if (!existingProject) {
      return res.status(404).json({ message: "Projeto não encontrado." });
    }

    if (!allowed) {
      return res.status(403).json({ message: "Sem permissão para este projeto." });
    }

    const project = await Project.findByIdAndUpdate(
      id,
      { name: normalizedName },
      { new: true },
    );

    if (!project) {
      return res.status(404).json({ message: "Projeto não encontrado." });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error("Erro em updateProject:", error.message);
    res.status(500).json({ message: "Erro interno ao atualizar projeto." });
  }
};

// 4. APAGAR UM PROJETO (E SUAS TAREFAS)
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Projeto inválido." });
    }

    const { allowed, project: existingProject } = await canUserAccessProjectWithRole(
      req.user,
      id,
      "admin",
    );

    if (!existingProject) {
      return res.status(404).json({ message: "Projeto não encontrado." });
    }

    if (!allowed) {
      return res.status(403).json({ message: "Sem permissão para este projeto." });
    }

    // 1º passo: apaga o projeto após validar permissão de admin no projeto
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({ message: "Projeto não encontrado." });
    }

    // 2º passo: Apaga todas as tarefas que pertenciam a este projeto
    await Promise.all([
      Task.deleteMany({ project: id }),
      TeamInvite.deleteMany({ project: id }),
    ]);

    res.status(200).json({ message: "Projeto e tarefas associadas excluídos com sucesso." });
  } catch (error) {
    console.error("Erro em deleteProject:", error.message);
    res.status(500).json({ message: "Erro interno ao excluir projeto." });
  }
};
