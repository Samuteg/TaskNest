import mongoose from "mongoose";
import CollaborationEvent from "../models/collaborationEvent.model.js";
import Task from "../models/Task.js";
import { canUserAccessProjectWithRole } from "../lib/teamAccess.js";
import {
  createActivityEvent,
  createCommentEvent,
  createMentionNotifications,
  createNotificationEvent,
  extractMentionEmails,
} from "../lib/collaboration.js";

const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const runSafeCollaborationOperation = async (action) => {
  try {
    return await action();
  } catch (error) {
    console.error("Erro ao registrar evento de colaboração:", error.message);
    return null;
  }
};

const findTaskFromProject = async (taskId, projectId) => {
  if (!taskId) return null;
  if (!mongoose.isValidObjectId(taskId)) return null;
  return Task.findOne({ _id: taskId, project: projectId }).select(
    "_id title assignee",
  );
};

export const getProjectCollaborationFeed = async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({ message: "Projeto inválido." });
    }

    const { allowed, project } = await canUserAccessProjectWithRole(
      req.user,
      projectId,
      "viewer",
    );
    if (!project) {
      return res.status(404).json({ message: "Projeto não encontrado." });
    }
    if (!allowed) {
      return res
        .status(403)
        .json({ message: "Sem permissão para este projeto." });
    }

    const requesterEmail = normalizeEmail(req.user?.email);

    const [comments, activities, notifications] = await Promise.all([
      CollaborationEvent.find({ project: projectId, kind: "comment" })
        .populate("actor", "fullName email")
        .populate("task", "title")
        .sort({ createdAt: -1 })
        .limit(40),
      CollaborationEvent.find({ project: projectId, kind: "activity" })
        .populate("actor", "fullName email")
        .populate("task", "title")
        .sort({ createdAt: -1 })
        .limit(80),
      CollaborationEvent.find({
        project: projectId,
        kind: "notification",
        audienceEmail: requesterEmail,
      })
        .populate("actor", "fullName email")
        .populate("task", "title")
        .sort({ createdAt: -1 })
        .limit(40),
    ]);

    res.status(200).json({
      comments,
      activities,
      notifications,
    });
  } catch (error) {
    console.error("Erro em getProjectCollaborationFeed:", error.message);
    res.status(500).json({ message: "Erro interno ao carregar colaboração." });
  }
};

export const createProjectComment = async (req, res) => {
  try {
    const { projectId } = req.params;
    const content = String(req.body?.content || "").trim();
    const taskId = req.body?.taskId || null;

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({ message: "Projeto inválido." });
    }

    const { allowed, project } = await canUserAccessProjectWithRole(
      req.user,
      projectId,
      "viewer",
    );
    if (!project) {
      return res.status(404).json({ message: "Projeto não encontrado." });
    }
    if (!allowed) {
      return res
        .status(403)
        .json({ message: "Sem permissão para este projeto." });
    }

    if (!content) {
      return res.status(400).json({ message: "Escreva um comentário." });
    }
    if (content.length > 2000) {
      return res.status(400).json({ message: "Comentário muito longo." });
    }

    const relatedTask = await findTaskFromProject(taskId, projectId);
    if (taskId && !relatedTask) {
      return res
        .status(400)
        .json({ message: "Tarefa inválida para o comentário." });
    }

    const mentionEmails = extractMentionEmails(content);

    const createdComment = await createCommentEvent({
      projectId,
      taskId: relatedTask?._id || null,
      actorId: req.user._id,
      content,
      mentions: mentionEmails,
      metadata: {
        action: "comment.created",
      },
    });

    if (!createdComment) {
      return res
        .status(500)
        .json({ message: "Não foi possível registrar este comentário." });
    }

    const actorName = req.user?.fullName || req.user?.email || "Alguém";
    await runSafeCollaborationOperation(() =>
      createActivityEvent({
        projectId,
        taskId: relatedTask?._id || null,
        actorId: req.user._id,
        content: relatedTask
          ? `${actorName} comentou na tarefa "${relatedTask.title}".`
          : `${actorName} comentou no projeto.`,
        metadata: {
          action: "comment.activity",
        },
      }),
    );

    const mentionNotificationMessage = relatedTask
      ? `${actorName} mencionou você em "${relatedTask.title}".`
      : `${actorName} mencionou você em um comentário do projeto.`;

    await runSafeCollaborationOperation(() =>
      createMentionNotifications({
        projectId,
        taskId: relatedTask?._id || null,
        actorId: req.user._id,
        content,
        excludeEmails: [req.user?.email],
        notificationMessage: mentionNotificationMessage,
        metadata: {
          action: "mention.created",
        },
      }),
    );

    const normalizedAssignee = normalizeEmail(relatedTask?.assignee);
    const requesterEmail = normalizeEmail(req.user?.email);

    if (
      normalizedAssignee &&
      emailRegex.test(normalizedAssignee) &&
      normalizedAssignee !== requesterEmail &&
      !mentionEmails.includes(normalizedAssignee)
    ) {
      await runSafeCollaborationOperation(() =>
        createNotificationEvent({
          projectId,
          taskId: relatedTask?._id || null,
          actorId: req.user._id,
          audienceEmail: normalizedAssignee,
          content: `${actorName} comentou na tarefa "${relatedTask?.title || "sem título"}".`,
          metadata: {
            action: "task.comment.assignee",
          },
        }),
      );
    }

    const populatedComment = await CollaborationEvent.findById(
      createdComment._id,
    )
      .populate("actor", "fullName email")
      .populate("task", "title");

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error("Erro em createProjectComment:", error.message);
    res.status(500).json({ message: "Erro interno ao criar comentário." });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    if (!mongoose.isValidObjectId(notificationId)) {
      return res.status(400).json({ message: "Notificação inválida." });
    }

    const requesterEmail = normalizeEmail(req.user?.email);

    const notification = await CollaborationEvent.findOne({
      _id: notificationId,
      kind: "notification",
      audienceEmail: requesterEmail,
    })
      .populate("actor", "fullName email")
      .populate("task", "title");

    if (!notification) {
      return res.status(404).json({ message: "Notificação não encontrada." });
    }

    if (!notification.readAt) {
      notification.readAt = new Date();
      await notification.save();
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error("Erro em markNotificationAsRead:", error.message);
    res.status(500).json({ message: "Erro interno ao atualizar notificação." });
  }
};
