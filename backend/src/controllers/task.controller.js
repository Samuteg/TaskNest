import Task from "../models/Task.js";
import mongoose from "mongoose";
import { canUserAccessProject } from "../lib/teamAccess.js";

const allowedStatuses = new Set(["todo", "in-progress", "done"]);
const allowedPriorities = new Set(["low", "medium", "high"]);

const parseDueDate = (rawDueDate) => {
  if (
    typeof rawDueDate === "undefined" ||
    rawDueDate === null ||
    rawDueDate === ""
  ) {
    return { value: null };
  }

  const normalizedInput =
    typeof rawDueDate === "string" ? rawDueDate.trim() : rawDueDate;

  if (typeof normalizedInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(normalizedInput)) {
    const parsedDate = new Date(`${normalizedInput}T12:00:00.000Z`);
    if (Number.isNaN(parsedDate.getTime())) {
      return { error: "Prazo inválido." };
    }
    return { value: parsedDate };
  }

  const parsedDate = new Date(normalizedInput);
  if (Number.isNaN(parsedDate.getTime())) {
    return { error: "Prazo inválido." };
  }

  return { value: parsedDate };
};

const normalizeChecklist = (rawChecklist) => {
  if (!Array.isArray(rawChecklist)) {
    return { error: "Checklist inválida." };
  }

  if (rawChecklist.length > 30) {
    return { error: "Checklist pode ter no máximo 30 itens." };
  }

  const normalizedChecklist = rawChecklist
    .map((item) => {
      const text = typeof item?.text === "string" ? item.text.trim() : "";
      if (!text) return null;
      return {
        text: text.slice(0, 200),
        done: Boolean(item?.done),
      };
    })
    .filter(Boolean);

  return { value: normalizedChecklist };
};

export const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({ message: "Projeto inválido." });
    }

    const { allowed, project } = await canUserAccessProject(req.user, projectId);
    if (!project) {
      return res.status(404).json({ message: "Projeto não encontrado." });
    }
    if (!allowed) {
      return res.status(403).json({ message: "Sem permissão para este projeto." });
    }

    // Usuários com acesso ao projeto veem todas as tarefas do quadro
    const tasks = await Task.find({
      project: projectId,
    }).sort({ order: 1, createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error.message);
    res.status(500).json({ message: "Erro ao buscar tarefas." });
  }
};

export const createTask = async (req, res) => {
  try {
    const title = String(req.body?.title || "").trim();
    const description =
      typeof req.body?.description === "string"
      ? req.body.description.trim()
      : "";
    const project = String(req.body?.project || "");
    const status = String(req.body?.status || "todo");
    const rawPriority = String(req.body?.priority || "medium");
    const assignee =
      typeof req.body?.assignee === "string" ? req.body.assignee.trim() : "";
    const checklistInput =
      typeof req.body?.checklist === "undefined" ? [] : req.body.checklist;

    if (!title || !project) {
      return res.status(400).json({ message: "Título e projeto são obrigatórios." });
    }

    if (!mongoose.isValidObjectId(project)) {
      return res.status(400).json({ message: "Projeto inválido." });
    }

    const { allowed, project: existingProject } = await canUserAccessProject(
      req.user,
      project,
    );
    if (!existingProject) {
      return res.status(404).json({ message: "Projeto não encontrado." });
    }
    if (!allowed) {
      return res.status(403).json({ message: "Sem permissão para este projeto." });
    }

    if (assignee.length > 120) {
      return res.status(400).json({
        message: "Responsável deve ter no máximo 120 caracteres.",
      });
    }

    const dueDateResult = parseDueDate(req.body?.dueDate);
    if (dueDateResult.error) {
      return res.status(400).json({ message: dueDateResult.error });
    }

    if (!allowedPriorities.has(rawPriority)) {
      return res.status(400).json({ message: "Prioridade inválida." });
    }

    const checklistResult = normalizeChecklist(checklistInput);
    if (checklistResult.error) {
      return res.status(400).json({ message: checklistResult.error });
    }

    const latestTask = await Task.findOne({
      project,
    }).sort({ order: -1, createdAt: -1 });

    const nextOrder =
      typeof latestTask?.order === "number" ? latestTask.order + 1 : 0;

    const newTask = new Task({
      title,
      description,
      status: allowedStatuses.has(status) ? status : "todo",
      dueDate: dueDateResult.value,
      priority: rawPriority,
      assignee,
      checklist: checklistResult.value,
      project,
      user: req.user._id,
      order: nextOrder,
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Erro ao criar tarefa:", error.message);
    res.status(500).json({ message: "Erro interno ao criar tarefa." });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body || {};
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Tarefa inválida." });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Tarefa não encontrada." });
    }

    const { allowed } = await canUserAccessProject(req.user, task.project);
    if (!allowed) {
      return res.status(403).json({ message: "Sem permissão para este projeto." });
    }

    const updateData = {};
    if (typeof req.body?.title === "string") {
      const normalizedTitle = req.body.title.trim();
      if (!normalizedTitle) {
        return res.status(400).json({ message: "Título da tarefa é obrigatório." });
      }
      updateData.title = normalizedTitle;
    }

    if (typeof req.body?.description === "string") {
      updateData.description = req.body.description.trim();
    }

    if (Object.prototype.hasOwnProperty.call(payload, "status")) {
      if (
        typeof req.body?.status !== "string" ||
        !allowedStatuses.has(req.body.status)
      ) {
        return res.status(400).json({ message: "Status inválido." });
      }
      updateData.status = req.body.status;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "priority")) {
      if (
        typeof req.body?.priority !== "string" ||
        !allowedPriorities.has(req.body.priority)
      ) {
        return res.status(400).json({ message: "Prioridade inválida." });
      }
      updateData.priority = req.body.priority;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "dueDate")) {
      const dueDateResult = parseDueDate(req.body?.dueDate);
      if (dueDateResult.error) {
        return res.status(400).json({ message: dueDateResult.error });
      }
      updateData.dueDate = dueDateResult.value;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "assignee")) {
      if (typeof req.body?.assignee !== "string") {
        return res.status(400).json({ message: "Responsável inválido." });
      }

      const normalizedAssignee = req.body.assignee.trim();
      if (normalizedAssignee.length > 120) {
        return res.status(400).json({
          message: "Responsável deve ter no máximo 120 caracteres.",
        });
      }

      updateData.assignee = normalizedAssignee;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "checklist")) {
      const checklistResult = normalizeChecklist(req.body?.checklist);
      if (checklistResult.error) {
        return res.status(400).json({ message: checklistResult.error });
      }
      updateData.checklist = checklistResult.value;
    }

    if (
      typeof req.body?.order === "number" &&
      Number.isFinite(req.body.order) &&
      req.body.order >= 0
    ) {
      updateData.order = Math.floor(req.body.order);
    }

    if (!Object.keys(updateData).length) {
      return res.status(400).json({ message: "Nenhum dado válido para atualizar." });
    }

    Object.assign(task, updateData);
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error.message);
    res.status(500).json({ message: "Erro interno ao atualizar tarefa." });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Tarefa inválida." });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Tarefa não encontrada." });
    }

    const { allowed } = await canUserAccessProject(req.user, task.project);
    if (!allowed) {
      return res.status(403).json({ message: "Sem permissão para este projeto." });
    }

    await task.deleteOne();
    res.status(200).json({ message: "Tarefa excluída." });
  } catch (error) {
    console.error("Erro ao excluir tarefa:", error.message);
    res.status(500).json({ message: "Erro interno ao excluir tarefa." });
  }
};
