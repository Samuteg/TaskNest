import mongoose from "mongoose";
import CollaborationEvent from "../models/collaborationEvent.model.js";

const mentionEmailRegex = /@([^\s@]+@[^\s@]+\.[^\s@]+)/g;

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const asObjectId = (value) => {
  if (!value || !mongoose.isValidObjectId(value)) return null;
  return new mongoose.Types.ObjectId(value);
};

const buildEventPayload = ({
  projectId,
  taskId = null,
  actorId = null,
  content,
  metadata = {},
}) => {
  const project = asObjectId(projectId);
  const normalizedContent = String(content || "").trim();

  if (!project || !normalizedContent) return null;

  return {
    project,
    task: asObjectId(taskId),
    actor: asObjectId(actorId),
    content: normalizedContent.slice(0, 2000),
    metadata,
  };
};

export const extractMentionEmails = (text): string[] => {
  const normalizedText = String(text || "");
  const emails = new Set<string>();

  let match = mentionEmailRegex.exec(normalizedText);
  while (match) {
    emails.add(normalizeEmail(match[1]));
    match = mentionEmailRegex.exec(normalizedText);
  }

  mentionEmailRegex.lastIndex = 0;

  return [...emails];
};

export const createActivityEvent = async ({
  projectId,
  taskId = null,
  actorId = null,
  content,
  metadata = {},
}) => {
  const payload = buildEventPayload({
    projectId,
    taskId,
    actorId,
    content,
    metadata,
  });

  if (!payload) return null;

  return CollaborationEvent.create({
    ...payload,
    kind: "activity",
  });
};

export const createCommentEvent = async ({
  projectId,
  taskId = null,
  actorId = null,
  content,
  mentions = [],
  metadata = {},
}) => {
  const payload = buildEventPayload({
    projectId,
    taskId,
    actorId,
    content,
    metadata,
  });

  if (!payload) return null;

  const normalizedMentions = [...new Set(mentions.map(normalizeEmail))].filter(
    Boolean,
  );

  return CollaborationEvent.create({
    ...payload,
    kind: "comment",
    mentions: normalizedMentions,
  });
};

export const createNotificationEvent = async ({
  projectId,
  taskId = null,
  actorId = null,
  audienceEmail,
  content,
  metadata = {},
}) => {
  const payload = buildEventPayload({
    projectId,
    taskId,
    actorId,
    content,
    metadata,
  });

  const normalizedAudienceEmail = normalizeEmail(audienceEmail);

  if (!payload || !normalizedAudienceEmail) return null;

  return CollaborationEvent.create({
    ...payload,
    kind: "notification",
    audienceEmail: normalizedAudienceEmail,
  });
};

export const createMentionNotifications = async ({
  projectId,
  taskId = null,
  actorId = null,
  content,
  excludeEmails = [],
  notificationMessage,
  metadata = {},
}) => {
  const mentionedEmails = extractMentionEmails(content);
  const blockedEmails = new Set<string>(
    excludeEmails.map((email) => normalizeEmail(String(email))),
  );

  const targetEmails = mentionedEmails.filter((email) => !blockedEmails.has(email));

  if (!targetEmails.length) return [];

  const created = await Promise.all(
    targetEmails.map((email) =>
      createNotificationEvent({
        projectId,
        taskId,
        actorId,
        audienceEmail: email,
        content: notificationMessage || "Você foi mencionado em um comentário.",
        metadata,
      }),
    ),
  );

  return created.filter(Boolean);
};
