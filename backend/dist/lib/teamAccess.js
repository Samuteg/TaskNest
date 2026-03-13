import TeamInvite from "../models/teamInvite.model.js";
import Project from "../models/project.model.js";
export const PROJECT_ROLES = ["viewer", "editor", "admin"];
const roleWeightByRole = {
    viewer: 1,
    editor: 2,
    admin: 3,
};
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
export const normalizeProjectRole = (role) => {
    const normalizedRole = String(role || "")
        .trim()
        .toLowerCase();
    if (PROJECT_ROLES.includes(normalizedRole)) {
        return normalizedRole;
    }
    return "viewer";
};
export const hasProjectRole = (currentRole, minimumRole = "viewer") => {
    const normalizedCurrentRole = normalizeProjectRole(currentRole);
    const normalizedMinimumRole = normalizeProjectRole(minimumRole);
    return ((roleWeightByRole[normalizedCurrentRole] || 0) >=
        (roleWeightByRole[normalizedMinimumRole] || 0));
};
const buildAcceptedInviteRoleMap = (invites) => {
    const accessByProjectId = new Map();
    const seenProjectIds = new Set();
    invites.forEach((invite) => {
        if (!invite?.project)
            return;
        const projectId = invite.project.toString();
        if (seenProjectIds.has(projectId))
            return;
        seenProjectIds.add(projectId);
        if (invite.status !== "accepted")
            return;
        accessByProjectId.set(projectId, normalizeProjectRole(invite.role));
    });
    return accessByProjectId;
};
const getAcceptedInviteRoleMapForUser = async (user) => {
    const invites = await TeamInvite.find({
        email: normalizeEmail(user.email),
        project: { $ne: null },
    })
        .sort({ updatedAt: -1, createdAt: -1 })
        .select("project status role");
    return buildAcceptedInviteRoleMap(invites);
};
export const getProjectAccessMapForUser = async (user) => {
    const [ownedProjects, invitedProjectRoleMap] = await Promise.all([
        Project.find({ user: user._id }).select("_id").lean(),
        getAcceptedInviteRoleMapForUser(user),
    ]);
    const accessByProjectId = new Map();
    invitedProjectRoleMap.forEach((role, projectId) => {
        accessByProjectId.set(projectId, {
            role,
            isOwner: false,
        });
    });
    ownedProjects.forEach((project) => {
        accessByProjectId.set(project._id.toString(), {
            role: "admin",
            isOwner: true,
        });
    });
    return accessByProjectId;
};
export const getAccessibleProjectIds = async (user) => {
    const accessByProjectId = await getProjectAccessMapForUser(user);
    return [...accessByProjectId.keys()];
};
export const canUserAccessProject = async (user, projectId) => {
    const project = await Project.findById(projectId).select("_id user");
    if (!project) {
        return {
            allowed: false,
            project: null,
            role: null,
            isOwner: false,
        };
    }
    if (project.user.toString() === user._id.toString()) {
        return {
            allowed: true,
            project,
            role: "admin",
            isOwner: true,
        };
    }
    const latestInvite = await TeamInvite.findOne({
        project: project._id,
        email: normalizeEmail(user.email),
    })
        .sort({ updatedAt: -1, createdAt: -1 })
        .select("status role");
    if (latestInvite?.status !== "accepted") {
        return {
            allowed: false,
            project,
            role: null,
            isOwner: false,
        };
    }
    return {
        allowed: true,
        project,
        role: normalizeProjectRole(latestInvite.role),
        isOwner: false,
    };
};
export const canUserAccessProjectWithRole = async (user, projectId, minimumRole = "viewer") => {
    const access = await canUserAccessProject(user, projectId);
    if (!access.allowed)
        return access;
    if (!hasProjectRole(access.role, minimumRole)) {
        return {
            ...access,
            allowed: false,
        };
    }
    return access;
};
