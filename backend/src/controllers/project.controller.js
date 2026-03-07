import Project from "../models/project.model.js";
import Task from "../models/Task.js"; // Precisamos importar o Task para apagar as tarefas associadas
import { getAccessibleOwnerIds } from "../lib/teamAccess.js";

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
    // Lista projetos próprios + projetos de usuários que convidaram este usuário e tiveram convite aceito
    const accessibleOwnerIds = await getAccessibleOwnerIds(req.user);
    const projects = await Project.find({
      user: { $in: accessibleOwnerIds },
    }).sort({ createdAt: -1 });

    res.status(200).json(projects);
  } catch (error) {
    console.error("Erro em getProjects:", error.message);
    res.status(500).json({ message: "Erro interno ao buscar projetos." });
  }
};

// 3. EDITAR O NOME DO PROJETO
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Procura o projeto pelo ID e garante que ele pertence ao usuário logado
    const project = await Project.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { name },
      { new: true } // Retorna o documento atualizado
    );

    if (!project) {
      return res.status(404).json({ message: "Projeto não encontrado ou não autorizado." });
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

    // 1º passo: Tenta apagar o projeto (garantindo que é o dono)
    const project = await Project.findOneAndDelete({ _id: id, user: req.user._id });

    if (!project) {
      return res.status(404).json({ message: "Projeto não encontrado ou não autorizado." });
    }

    // 2º passo: Apaga todas as tarefas que pertenciam a este projeto
    await Task.deleteMany({ project: id });

    res.status(200).json({ message: "Projeto e tarefas associadas excluídos com sucesso." });
  } catch (error) {
    console.error("Erro em deleteProject:", error.message);
    res.status(500).json({ message: "Erro interno ao excluir projeto." });
  }
};
