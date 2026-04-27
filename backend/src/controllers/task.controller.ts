import Task from "../models/Task.js";
import mongoose from "mongoose";
import { canUserAccessProjectWithRole } from "../lib/teamAccess.js";
import {
  createActivityEvent,
  createNotificationEvent,
} from "../lib/collaboration.js";

const allowedStatuses = new Set(["todo", "in-progress", "done"]);
const allowedPriorities = new Set(["low", "medium", "high"]);
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const statusLabelByValue = {
  todo: "Pendente",
  "in-progress": "Em progresso",
  done: "Concluída",
};

const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

const formatDueDateLabel = (dateValue) => {
  if (!dateValue) return "";
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("pt-BR");
};

const areDatesEqual = (a, b) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  const firstDate = new Date(a);
  const secondDate = new Date(b);
  if (Number.isNaN(firstDate.getTime()) || Number.isNaN(secondDate.getTime())) {
    return false;
  }
  return firstDate.getTime() === secondDate.getTime();
};

const listWithAnd = (parts) => {
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(", ")} e ${parts[parts.length - 1]}`;
};

const runSafeCollaborationOperation = async (action) => {
  try {
    await action();
  } catch (error) {
    console.error("Erro ao registrar colaboração:", error.message);
  }
};

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

  if (
    typeof normalizedInput === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(normalizedInput)
  ) {
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

export const getTasks = async (request, reply) => {
  try {
    const { projectId } = request.params;
    if (!mongoose.isValidObjectId(projectId)) {
      return reply.code(400).send({ message: "Projeto inválido." });
    }

    const { allowed, project } = await canUserAccessProjectWithRole(
      request.user,
      projectId,
      "viewer",
    );
    if (!project) {
      return reply.code(404).send({ message: "Projeto não encontrado." });
    }
    if (!allowed) {
      return reply
        .code(403)
        .send({ message: "Sem permissão para este projeto." });
    }

    // Usuários com acesso ao projeto veem todas as tarefas do quadro
    const tasks = await Task.find({
      project: projectId,
    }).sort({ order: 1, createdAt: -1 });

    reply.send(tasks);
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error.message);
    reply.code(500).send({ message: "Erro ao buscar tarefas." });
  }
};

export const createTask = async (request, reply) => {
  try {
    const title = String(request.body?.title || "").trim();
    const description =
      typeof request.body?.description === "string"
        ? request.body.description.trim()
        : "";
    const project = String(request.body?.project || "");
    const status = String(request.body?.status || "todo");
    const rawPriority = String(request.body?.priority || "medium");
    const assignee =
      typeof request.body?.assignee === "string" ? request.body.assignee.trim() : "";
    const checklistInput =
      typeof request.body?.checklist === "undefined" ? [] : request.body.checklist;

    if (!title || !project) {
      return reply
        .code(400)
        .send({ message: "Título e projeto são obrigatórios." });
    }

    if (!mongoose.isValidObjectId(project)) {
      return reply.code(400).send({ message: "Projeto inválido." });
    }

    const { allowed, project: existingProject } =
      await canUserAccessProjectWithRole(request.user, project, "editor");
    if (!existingProject) {
      return reply.code(404).send({ message: "Projeto não encontrado." });
    }
    if (!allowed) {
      return reply
        .code(403)
        .send({ message: "Sem permissão para este projeto." });
    }

    if (assignee.length > 120) {
      return reply.code(400).send({
        message: "Responsável deve ter no máximo 120 caracteres.",
      });
    }

    const dueDateResult = parseDueDate(request.body?.dueDate);
    if (dueDateResult.error) {
      return reply.code(400).send({ message: dueDateResult.error });
    }

    if (!allowedPriorities.has(rawPriority)) {
      return reply.code(400).send({ message: "Prioridade inválida." });
    }

    const checklistResult = normalizeChecklist(checklistInput);
    if (checklistResult.error) {
      return reply.code(400).send({ message: checklistResult.error });
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
      user: request.user._id,
      order: nextOrder,
    });

    await newTask.save();

    const actorName = request.user?.fullName || request.user?.email || "Alguém";
    await runSafeCollaborationOperation(() =>
      createActivityEvent({
        projectId: project,
        taskId: newTask._id,
        actorId: request.user._id,
        content: `${actorName} criou a tarefa "${newTask.title}".`,
        metadata: {
          action: "task.created",
        },
      }),
    );

    const assigneeEmail = normalizeEmail(newTask.assignee);
    const requesterEmail = normalizeEmail(request.user?.email);
    if (
      assigneeEmail &&
      emailRegex.test(assigneeEmail) &&
      assigneeEmail !== requesterEmail
    ) {
      await runSafeCollaborationOperation(() =>
        createNotificationEvent({
          projectId: project,
          taskId: newTask._id,
          actorId: request.user._id,
          audienceEmail: assigneeEmail,
          content: `${actorName} definiu você como responsável em "${newTask.title}".`,
          metadata: {
            action: "task.assignee.added",
          },
        }),
      );
    }

    reply.code(201).send(newTask);
  } catch (error) {
    console.error("Erro ao criar tarefa:", error.message);
    reply.code(500).send({ message: "Erro interno ao criar tarefa." });
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

    const { allowed } = await canUserAccessProjectWithRole(
      req.user,
      task.project,
      "editor",
    );
    if (!allowed) {
      return res
        .status(403)
        .json({ message: "Sem permissão para este projeto." });
    }

    const updateData: Record<string, any> = {};
    const previousTask = {
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || null,
      assignee: task.assignee || "",
      checklist: JSON.stringify(task.checklist || []),
    };

    if (typeof req.body?.title === "string") {
      const normalizedTitle = req.body.title.trim();
      if (!normalizedTitle) {
        return res
          .status(400)
          .json({ message: "Título da tarefa é obrigatório." });
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
      return res
        .status(400)
        .json({ message: "Nenhum dado válido para atualizar." });
    }

    Object.assign(task, updateData);
    await task.save();

    const changedParts = [];
    if (
      Object.prototype.hasOwnProperty.call(updateData, "status") &&
      updateData.status !== previousTask.status
    ) {
      changedParts.push(
        `status para ${statusLabelByValue[updateData.status] || updateData.status}`,
      );
    }
    if (
      Object.prototype.hasOwnProperty.call(updateData, "title") &&
      updateData.title !== previousTask.title
    ) {
      changedParts.push("título");
    }
    if (
      Object.prototype.hasOwnProperty.call(updateData, "description") &&
      updateData.description !== previousTask.description
    ) {
      changedParts.push("descrição");
    }
    if (
      Object.prototype.hasOwnProperty.call(updateData, "priority") &&
      updateData.priority !== previousTask.priority
    ) {
      changedParts.push("prioridade");
    }
    if (
      Object.prototype.hasOwnProperty.call(updateData, "dueDate") &&
      !areDatesEqual(updateData.dueDate, previousTask.dueDate)
    ) {
      if (updateData.dueDate) {
        changedParts.push(
          `prazo para ${formatDueDateLabel(updateData.dueDate)}`,
        );
      } else {
        changedParts.push("prazo");
      }
    }
    if (
      Object.prototype.hasOwnProperty.call(updateData, "assignee") &&
      updateData.assignee !== previousTask.assignee
    ) {
      if (updateData.assignee) {
        changedParts.push(`responsável para ${updateData.assignee}`);
      } else {
        changedParts.push("responsável");
      }
    }
    if (
      Object.prototype.hasOwnProperty.call(updateData, "checklist") &&
      JSON.stringify(updateData.checklist || []) !== previousTask.checklist
    ) {
      changedParts.push("checklist");
    }

    if (changedParts.length) {
      const actorName = req.user?.fullName || req.user?.email || "Alguém";
      await runSafeCollaborationOperation(() =>
        createActivityEvent({
          projectId: task.project,
          taskId: task._id,
          actorId: req.user._id,
          content: `${actorName} atualizou ${listWithAnd(changedParts)} na tarefa "${task.title}".`,
          metadata: {
            action: "task.updated",
            changedParts,
          },
        }),
      );
    }

    if (
      Object.prototype.hasOwnProperty.call(updateData, "assignee") &&
      updateData.assignee !== previousTask.assignee
    ) {
      const assigneeEmail = normalizeEmail(updateData.assignee);
      const requesterEmail = normalizeEmail(req.user?.email);
      if (
        assigneeEmail &&
        emailRegex.test(assigneeEmail) &&
        assigneeEmail !== requesterEmail
      ) {
        const actorName = req.user?.fullName || req.user?.email || "Alguém";
        await runSafeCollaborationOperation(() =>
          createNotificationEvent({
            projectId: task.project,
            taskId: task._id,
            actorId: req.user._id,
            audienceEmail: assigneeEmail,
            content: `${actorName} definiu você como responsável em "${task.title}".`,
            metadata: {
              action: "task.assignee.updated",
            },
          }),
        );
      }
    }

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

    const { allowed } = await canUserAccessProjectWithRole(
      req.user,
      task.project,
      "editor",
    );
    if (!allowed) {
      return res
        .status(403)
        .json({ message: "Sem permissão para este projeto." });
    }

    const taskTitle = task.title;
    const projectId = task.project;
    const taskId = task._id;

    await task.deleteOne();

    const actorName = req.user?.fullName || req.user?.email || "Alguém";
    await runSafeCollaborationOperation(() =>
      createActivityEvent({
        projectId,
        taskId,
        actorId: req.user._id,
        content: `${actorName} removeu a tarefa "${taskTitle}".`,
        metadata: {
          action: "task.deleted",
          taskTitle,
        },
      }),
    );

    res.status(200).json({ message: "Tarefa excluída." });
  } catch (error) {
    console.error("Erro ao excluir tarefa:", error.message);
    res.status(500).json({ message: "Erro interno ao excluir tarefa." });
  }
};
