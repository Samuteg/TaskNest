import TeamInvite from "../models/teamInvite.model.js";
import mongoose from "mongoose";
import {
  canUserAccessProjectWithRole,
  normalizeProjectRole,
  PROJECT_ROLES,
} from "../lib/teamAccess.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  } catch (error) {
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
  } catch (error) {
    console.error("Erro em listReceivedTeamInvites:", error.message);
    res.status(500).json({ message: "Erro interno ao listar convites recebidos." });
  }
};

export const createTeamInvite = async (req, res) => {
  try {
    const normalizedEmail = String(req.body?.email || "")
      .trim()
      .toLowerCase();
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
    const { allowed, project } = await canUserAccessProjectWithRole(
      req.user,
      projectId,
      "admin",
    );

    if (!project) {
      return res.status(404).json({ message: "Projeto não encontrado." });
    }

    if (!allowed) {
      return res.status(403).json({
        message: "Somente administradores do projeto podem enviar convites.",
      });
    }

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
      return res.status(200).json(latestInvite);
    }

    if (latestInvite?.status === "pending") {
      latestInvite.role = role;
      latestInvite.invitedBy = req.user._id;
      await latestInvite.save();
      await latestInvite.populate("project", "name");
      return res.status(200).json(latestInvite);
    }

    if (latestInvite?.status === "declined") {
      latestInvite.status = "pending";
      latestInvite.role = role;
      latestInvite.invitedBy = req.user._id;
      await latestInvite.save();
      await latestInvite.populate("project", "name");
      return res.status(200).json(latestInvite);
    }

    const invite = await TeamInvite.create({
      email: normalizedEmail,
      invitedBy: req.user._id,
      project: projectId,
      role,
    });
    await invite.populate("project", "name");

    res.status(201).json(invite);
  } catch (error) {
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

    const invite = await TeamInvite.findOne({ _id: id, project: { $ne: null } });

    if (!invite) {
      return res.status(404).json({ message: "Convite não encontrado." });
    }

    const { allowed, project } = await canUserAccessProjectWithRole(
      req.user,
      invite.project,
      "admin",
    );

    if (!project) {
      return res.status(404).json({ message: "Projeto não encontrado." });
    }

    if (!allowed) {
      return res.status(403).json({
        message: "Somente administradores do projeto podem remover convites.",
      });
    }

    const previousStatus = invite.status;

    if (previousStatus === "accepted") {
      await TeamInvite.deleteMany({
        email: invite.email,
        project: invite.project,
      });
      return res.status(200).json({ message: "Membro removido do projeto com sucesso." });
    }

    await invite.deleteOne();

    if (previousStatus === "declined") {
      return res.status(200).json({ message: "Registro de convite removido com sucesso." });
    }

    res.status(200).json({ message: "Convite cancelado com sucesso." });
  } catch (error) {
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

    res.status(200).json(invite);
  } catch (error) {
    console.error("Erro em respondToTeamInvite:", error.message);
    res.status(500).json({ message: "Erro interno ao responder convite." });
  }
};
