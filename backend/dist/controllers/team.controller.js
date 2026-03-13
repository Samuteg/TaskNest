import TeamInvite from "../models/teamInvite.model.js";
import mongoose from "mongoose";
import { canUserAccessProjectWithRole, normalizeProjectRole, PROJECT_ROLES, } from "../lib/teamAccess.js";
import { createActivityEvent, createNotificationEvent, } from "../lib/collaboration.js";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const roleLabelByValue = {
    viewer: "Viewer",
    editor: "Editor",
    admin: "Admin",
};
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const runSafeCollaborationOperation = async (action) => {
    try {
        await action();
    }
    catch (error) {
        console.error("Erro ao registrar colaboração de equipe:", error.message);
    }
};
export const listTeamInvites = async (req, res) => {
    try {
        const invites = await TeamInvite.find({
            invitedBy: req.user._id,
            project: { $ne: null },
        })
            .populate("project", "name")
            .sort({
            createdAt: -1,
        });
        res.status(200).json(invites);
    }
    catch (error) {
        console.error("Erro em listTeamInvites:", error.message);
        res.status(500).json({ message: "Erro interno ao listar convites." });
    }
};
export const listReceivedTeamInvites = async (req, res) => {
    try {
        const normalizedEmail = String(req.user?.email || "")
            .trim()
            .toLowerCase();
        const invites = await TeamInvite.find({
            email: normalizedEmail,
            project: { $ne: null },
        })
            .populate("invitedBy", "fullName email")
            .populate("project", "name")
            .sort({
            createdAt: -1,
        });
        res.status(200).json(invites);
    }
    catch (error) {
        console.error("Erro em listReceivedTeamInvites:", error.message);
        res.status(500).json({ message: "Erro interno ao listar convites recebidos." });
    }
};
export const createTeamInvite = async (req, res) => {
    try {
        const normalizedEmail = normalizeEmail(req.body?.email);
        const projectId = String(req.body?.projectId || "").trim();
        const rawRole = String(req.body?.role || "viewer")
            .trim()
            .toLowerCase();
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({ message: "Informe um e-mail válido." });
        }
        if (normalizedEmail === req.user.email.toLowerCase()) {
            return res.status(400).json({ message: "Você não pode convidar a si mesmo." });
        }
        if (!mongoose.isValidObjectId(projectId)) {
            return res.status(400).json({ message: "Projeto inválido." });
        }
        if (!PROJECT_ROLES.includes(rawRole)) {
            return res.status(400).json({
                message: "Papel inválido. Use 'viewer', 'editor' ou 'admin'.",
            });
        }
        const role = normalizeProjectRole(rawRole);
        const { allowed, project } = await canUserAccessProjectWithRole(req.user, projectId, "admin");
        if (!project) {
            return res.status(404).json({ message: "Projeto não encontrado." });
        }
        if (!allowed) {
            return res.status(403).json({
                message: "Somente administradores do projeto podem enviar convites.",
            });
        }
        const actorName = req.user?.fullName || req.user?.email || "Alguém";
        const projectName = project?.name || "Projeto";
        const roleLabel = roleLabelByValue[role] || "Viewer";
        const registerInviteEvents = async ({ action, activityContent, notificationContent, }) => {
            await runSafeCollaborationOperation(() => createActivityEvent({
                projectId,
                actorId: req.user._id,
                content: activityContent,
                metadata: {
                    action,
                    email: normalizedEmail,
                    role,
                },
            }));
            await runSafeCollaborationOperation(() => createNotificationEvent({
                projectId,
                actorId: req.user._id,
                audienceEmail: normalizedEmail,
                content: notificationContent,
                metadata: {
                    action,
                    role,
                },
            }));
        };
        const latestInvite = await TeamInvite.findOne({
            email: normalizedEmail,
            project: projectId,
        }).sort({ updatedAt: -1, createdAt: -1 });
        if (latestInvite?.status === "accepted") {
            if (normalizeProjectRole(latestInvite.role) === role) {
                return res.status(409).json({
                    message: "Este usuário já faz parte deste projeto com esse papel.",
                });
            }
            latestInvite.role = role;
            latestInvite.invitedBy = req.user._id;
            await latestInvite.save();
            await latestInvite.populate("project", "name");
            const inviteProjectName = latestInvite.project?.name || projectName;
            await registerInviteEvents({
                action: "team.member.role.updated",
                activityContent: `${actorName} atualizou o papel de ${normalizedEmail} para ${roleLabel} em "${inviteProjectName}".`,
                notificationContent: `Seu papel em "${inviteProjectName}" foi atualizado para ${roleLabel}.`,
            });
            return res.status(200).json(latestInvite);
        }
        if (latestInvite?.status === "pending") {
            latestInvite.role = role;
            latestInvite.invitedBy = req.user._id;
            await latestInvite.save();
            await latestInvite.populate("project", "name");
            const inviteProjectName = latestInvite.project?.name || projectName;
            await registerInviteEvents({
                action: "team.invite.updated",
                activityContent: `${actorName} atualizou o convite de ${normalizedEmail} para ${roleLabel} em "${inviteProjectName}".`,
                notificationContent: `Seu convite para "${inviteProjectName}" foi atualizado para o papel ${roleLabel}.`,
            });
            return res.status(200).json(latestInvite);
        }
        if (latestInvite?.status === "declined") {
            latestInvite.status = "pending";
            latestInvite.role = role;
            latestInvite.invitedBy = req.user._id;
            await latestInvite.save();
            await latestInvite.populate("project", "name");
            const inviteProjectName = latestInvite.project?.name || projectName;
            await registerInviteEvents({
                action: "team.invite.resent",
                activityContent: `${actorName} reenviou o convite para ${normalizedEmail} como ${roleLabel} em "${inviteProjectName}".`,
                notificationContent: `Você recebeu novamente um convite para "${inviteProjectName}" como ${roleLabel}.`,
            });
            return res.status(200).json(latestInvite);
        }
        const invite = await TeamInvite.create({
            email: normalizedEmail,
            invitedBy: req.user._id,
            project: projectId,
            role,
        });
        await invite.populate("project", "name");
        const inviteProjectName = invite.project?.name || projectName;
        await registerInviteEvents({
            action: "team.invite.created",
            activityContent: `${actorName} convidou ${normalizedEmail} como ${roleLabel} para "${inviteProjectName}".`,
            notificationContent: `Você recebeu um convite para colaborar em "${inviteProjectName}" como ${roleLabel}.`,
        });
        res.status(201).json(invite);
    }
    catch (error) {
        console.error("Erro em createTeamInvite:", error.message);
        res.status(500).json({ message: "Erro interno ao criar convite." });
    }
};
export const cancelTeamInvite = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "ID de convite inválido." });
        }
        const invite = await TeamInvite.findOne({ _id: id, project: { $ne: null } }).populate("project", "name");
        if (!invite) {
            return res.status(404).json({ message: "Convite não encontrado." });
        }
        const { allowed, project } = await canUserAccessProjectWithRole(req.user, invite.project?._id || invite.project, "admin");
        if (!project) {
            return res.status(404).json({ message: "Projeto não encontrado." });
        }
        if (!allowed) {
            return res.status(403).json({
                message: "Somente administradores do projeto podem remover convites.",
            });
        }
        const previousStatus = invite.status;
        const inviteEmail = normalizeEmail(invite.email);
        const projectId = invite.project?._id || invite.project;
        const actorName = req.user?.fullName || req.user?.email || "Alguém";
        const projectName = invite.project?.name || project?.name || "Projeto";
        if (previousStatus === "accepted") {
            await TeamInvite.deleteMany({
                email: invite.email,
                project: projectId,
            });
            await runSafeCollaborationOperation(() => createActivityEvent({
                projectId,
                actorId: req.user._id,
                content: `${actorName} removeu ${inviteEmail} do projeto "${projectName}".`,
                metadata: {
                    action: "team.member.removed",
                    email: inviteEmail,
                },
            }));
            await runSafeCollaborationOperation(() => createNotificationEvent({
                projectId,
                actorId: req.user._id,
                audienceEmail: inviteEmail,
                content: `Seu acesso ao projeto "${projectName}" foi removido.`,
                metadata: {
                    action: "team.member.removed",
                },
            }));
            return res.status(200).json({ message: "Membro removido do projeto com sucesso." });
        }
        await invite.deleteOne();
        const activityAction = previousStatus === "declined" ? "team.invite.record.removed" : "team.invite.canceled";
        const activityContent = previousStatus === "declined"
            ? `${actorName} removeu o registro de convite recusado de ${inviteEmail} em "${projectName}".`
            : `${actorName} cancelou o convite de ${inviteEmail} em "${projectName}".`;
        await runSafeCollaborationOperation(() => createActivityEvent({
            projectId,
            actorId: req.user._id,
            content: activityContent,
            metadata: {
                action: activityAction,
                email: inviteEmail,
                previousStatus,
            },
        }));
        if (previousStatus === "pending") {
            await runSafeCollaborationOperation(() => createNotificationEvent({
                projectId,
                actorId: req.user._id,
                audienceEmail: inviteEmail,
                content: `Seu convite para o projeto "${projectName}" foi cancelado.`,
                metadata: {
                    action: "team.invite.canceled",
                },
            }));
        }
        if (previousStatus === "declined") {
            return res.status(200).json({ message: "Registro de convite removido com sucesso." });
        }
        res.status(200).json({ message: "Convite cancelado com sucesso." });
    }
    catch (error) {
        console.error("Erro em cancelTeamInvite:", error.message);
        res.status(500).json({ message: "Erro interno ao cancelar convite." });
    }
};
export const respondToTeamInvite = async (req, res) => {
    try {
        const { id } = req.params;
        const normalizedEmail = String(req.user?.email || "")
            .trim()
            .toLowerCase();
        const { status } = req.body || {};
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "ID de convite inválido." });
        }
        if (!["accepted", "declined"].includes(status)) {
            return res.status(400).json({
                message: "Status inválido. Use 'accepted' ou 'declined'.",
            });
        }
        const invite = await TeamInvite.findOne({
            _id: id,
            email: normalizedEmail,
            project: { $ne: null },
        })
            .populate("invitedBy", "fullName email")
            .populate("project", "name");
        if (!invite) {
            return res.status(404).json({ message: "Convite não encontrado." });
        }
        if (invite.status === status) {
            return res.status(200).json(invite);
        }
        if (invite.status === "accepted") {
            return res.status(400).json({
                message: "Este convite já foi aceito. Peça a um admin para remover você do projeto.",
            });
        }
        // Permite transição de pending -> accepted/declined
        // e também declined -> accepted (reconsideração do convite)
        invite.status = status;
        await invite.save();
        const projectId = invite.project?._id || invite.project;
        const projectName = invite.project?.name || "Projeto";
        const actorName = req.user?.fullName || req.user?.email || "Alguém";
        const action = status === "accepted" ? "team.invite.accepted" : "team.invite.declined";
        const activityContent = status === "accepted"
            ? `${actorName} aceitou o convite para "${projectName}".`
            : `${actorName} recusou o convite para "${projectName}".`;
        await runSafeCollaborationOperation(() => createActivityEvent({
            projectId,
            actorId: req.user._id,
            content: activityContent,
            metadata: {
                action,
                email: normalizedEmail,
            },
        }));
        const inviterEmail = normalizeEmail(invite.invitedBy?.email);
        if (inviterEmail && emailRegex.test(inviterEmail) && inviterEmail !== normalizedEmail) {
            await runSafeCollaborationOperation(() => createNotificationEvent({
                projectId,
                actorId: req.user._id,
                audienceEmail: inviterEmail,
                content: status === "accepted"
                    ? `${actorName} aceitou seu convite para "${projectName}".`
                    : `${actorName} recusou seu convite para "${projectName}".`,
                metadata: {
                    action,
                    email: normalizedEmail,
                },
            }));
        }
        res.status(200).json(invite);
    }
    catch (error) {
        console.error("Erro em respondToTeamInvite:", error.message);
        res.status(500).json({ message: "Erro interno ao responder convite." });
    }
};
