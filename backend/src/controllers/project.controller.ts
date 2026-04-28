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
export const createProject = async (request, reply) => {
  try {
    const { name } = request.body;

    if (!name) {
      return reply
        .code(400)
        .send({ message: "O nome do projeto é obrigatório." });
    }

    // request.user vem do seu middleware de autenticação (protectRoute)
    const newProject = new Project({
      name,
      user: request.user._id,
    });

    await newProject.save();
    reply.code(201).send(newProject);
  } catch (error) {
    console.error("Erro em createProject:", error.message);
    reply.code(500).send({ message: "Erro interno ao criar projeto." });
  }
};

// 2. LISTAR TODOS OS PROJETOS DO USUÁRIO
export const getProjects = async (request, reply) => {
  try {
    const [accessibleProjectIds, accessByProjectId] = await Promise.all([
      getAccessibleProjectIds(request.user),
      getProjectAccessMapForUser(request.user),
    ]);

    if (!accessibleProjectIds.length) {
      return reply.code(200).send([]);
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

    reply.code(200).send(projectsWithAccess);
  } catch (error) {
    console.error("Erro em getProjects:", error.message);
    reply.code(500).send({ message: "Erro interno ao buscar projetos." });
  }
};

// 3. EDITAR O NOME DO PROJETO
export const updateProject = async (request, reply) => {
  try {
    const { id } = request.params;
    const normalizedName = String(request.body?.name || "").trim();

    if (!mongoose.isValidObjectId(id)) {
      return reply.code(400).send({ message: "Projeto inválido." });
    }

    if (!normalizedName) {
      return reply
        .code(400)
        .send({ message: "O nome do projeto é obrigatório." });
    }

    const { allowed, project: existingProject } =
      await canUserAccessProjectWithRole(request.user, id, "admin");

    if (!existingProject) {
      return reply.code(404).send({ message: "Projeto não encontrado." });
    }

    if (!allowed) {
      return reply
        .code(403)
        .send({ message: "Sem permissão para este projeto." });
    }

    const project = await Project.findByIdAndUpdate(
      id,
      { name: normalizedName },
      { new: true },
    );

    if (!project) {
      return reply.code(404).send({ message: "Projeto não encontrado." });
    }

    reply.code(200).send(project);
  } catch (error) {
    console.error("Erro em updateProject:", error.message);
    reply.code(500).send({ message: "Erro interno ao atualizar projeto." });
  }
};

// 4. APAGAR UM PROJETO (E SUAS TAREFAS)
export const deleteProject = async (request, reply) => {
  try {
    const { id } = request.params;
    if (!mongoose.isValidObjectId(id)) {
      return reply.code(400).send({ message: "Projeto inválido." });
    }

    const { allowed, project: existingProject } =
      await canUserAccessProjectWithRole(request.user, id, "admin");

    if (!existingProject) {
      return reply.code(404).send({ message: "Projeto não encontrado." });
    }

    if (!allowed) {
      return reply
        .code(403)
        .send({ message: "Sem permissão para este projeto." });
    }

    // 1º passo: apaga o projeto após validar permissão de admin no projeto
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return reply.code(404).send({ message: "Projeto não encontrado." });
    }

    // 2º passo: Apaga todas as tarefas que pertenciam a este projeto
    await Promise.all([
      Task.deleteMany({ project: id }),
      TeamInvite.deleteMany({ project: id }),
    ]);

    reply
      .code(200)
      .send({ message: "Projeto e tarefas associadas excluídos com sucesso." });
  } catch (error) {
    console.error("Erro em deleteProject:", error.message);
    reply.code(500).send({ message: "Erro interno ao excluir projeto." });
  }
};
