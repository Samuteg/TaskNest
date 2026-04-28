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

export const getProjectCollaborationFeed = async (request, reply) => {
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

    const requesterEmail = normalizeEmail(request.user?.email);

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

    reply.code(200).send({
      comments,
      activities,
      notifications,
    });
  } catch (error) {
    console.error("Erro em getProjectCollaborationFeed:", error.message);
    reply.code(500).send({ message: "Erro interno ao carregar colaboração." });
  }
};

export const createProjectComment = async (request, reply) => {
  try {
    const { projectId } = request.params;
    const content = String(request.body?.content || "").trim();
    const taskId = request.body?.taskId || null;

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

    if (!content) {
      return reply.code(400).send({ message: "Escreva um comentário." });
    }
    if (content.length > 2000) {
      return reply.code(400).send({ message: "Comentário muito longo." });
    }

    const relatedTask = await findTaskFromProject(taskId, projectId);
    if (taskId && !relatedTask) {
      return reply
        .code(400)
        .send({ message: "Tarefa inválida para o comentário." });
    }

    const mentionEmails = extractMentionEmails(content);

    const createdComment = await createCommentEvent({
      projectId,
      taskId: relatedTask?._id || null,
      actorId: request.user._id,
      content,
      mentions: mentionEmails,
      metadata: {
        action: "comment.created",
      },
    });

    if (!createdComment) {
      return reply
        .code(500)
        .send({ message: "Não foi possível registrar este comentário." });
    }

    const actorName = request.user?.fullName || request.user?.email || "Alguém";
    await runSafeCollaborationOperation(() =>
      createActivityEvent({
        projectId,
        taskId: relatedTask?._id || null,
        actorId: request.user._id,
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
        actorId: request.user._id,
        content,
        excludeEmails: [request.user?.email],
        notificationMessage: mentionNotificationMessage,
        metadata: {
          action: "mention.created",
        },
      }),
    );

    const normalizedAssignee = normalizeEmail(relatedTask?.assignee);
    const requesterEmail = normalizeEmail(request.user?.email);

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
          actorId: request.user._id,
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

    reply.code(201).send(populatedComment);
  } catch (error) {
    console.error("Erro em createProjectComment:", error.message);
    reply.code(500).send({ message: "Erro interno ao criar comentário." });
  }
};

export const markNotificationAsRead = async (request, reply) => {
  try {
    const { notificationId } = request.params;
    if (!mongoose.isValidObjectId(notificationId)) {
      return reply.code(400).send({ message: "Notificação inválida." });
    }

    const requesterEmail = normalizeEmail(request.user?.email);

    const notification = await CollaborationEvent.findOne({
      _id: notificationId,
      kind: "notification",
      audienceEmail: requesterEmail,
    })
      .populate("actor", "fullName email")
      .populate("task", "title");

    if (!notification) {
      return reply.code(404).send({ message: "Notificação não encontrada." });
    }

    if (!notification.readAt) {
      notification.readAt = new Date();
      await notification.save();
    }

    reply.code(200).send(notification);
  } catch (error) {
    console.error("Erro em markNotificationAsRead:", error.message);
    reply.code(500).send({ message: "Erro interno ao atualizar notificação." });
  }
};
