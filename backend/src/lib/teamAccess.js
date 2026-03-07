import TeamInvite from "../models/teamInvite.model.js";
import Project from "../models/project.model.js";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

export const getAccessibleOwnerIds = async (user) => {
  const invites = await TeamInvite.find({
    email: normalizeEmail(user.email),
  })
    .sort({ updatedAt: -1, createdAt: -1 })
    .select("invitedBy status");

  const ownerIdsByString = new Set([user._id.toString()]);

  const latestInviteByOwner = new Map();
  invites.forEach((invite) => {
    if (!invite?.invitedBy) return;
    const ownerId = invite.invitedBy.toString();
    if (!latestInviteByOwner.has(ownerId)) {
      latestInviteByOwner.set(ownerId, invite);
    }
  });

  latestInviteByOwner.forEach((invite, ownerId) => {
    if (invite.status === "accepted") ownerIdsByString.add(ownerId);
  });

  return [...ownerIdsByString];
};

export const canUserAccessProject = async (user, projectId) => {
  const project = await Project.findById(projectId).select("_id user");
  if (!project) return { allowed: false, project: null };

  if (project.user.toString() === user._id.toString()) {
    return { allowed: true, project };
  }

  const latestInvite = await TeamInvite.findOne({
    invitedBy: project.user,
    email: normalizeEmail(user.email),
  })
    .sort({ updatedAt: -1, createdAt: -1 })
    .select("status");

  return { allowed: latestInvite?.status === "accepted", project };
};
