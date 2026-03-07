import TeamInvite from "../models/teamInvite.model.js";
import mongoose from "mongoose";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const listTeamInvites = async (req, res) => {
  try {
    const invites = await TeamInvite.find({ invitedBy: req.user._id }).sort({
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

    const invites = await TeamInvite.find({ email: normalizedEmail })
      .populate("invitedBy", "fullName email")
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

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: "Informe um e-mail válido." });
    }

    if (normalizedEmail === req.user.email.toLowerCase()) {
      return res.status(400).json({ message: "Você não pode convidar a si mesmo." });
    }

    const latestInvite = await TeamInvite.findOne({
      invitedBy: req.user._id,
      email: normalizedEmail,
    }).sort({ updatedAt: -1, createdAt: -1 });

    if (latestInvite?.status === "accepted") {
      return res.status(409).json({
        message: "Este usuário já faz parte da equipe.",
      });
    }

    if (latestInvite?.status === "pending") {
      return res.status(200).json(latestInvite);
    }

    if (latestInvite?.status === "declined") {
      latestInvite.status = "pending";
      await latestInvite.save();
      return res.status(200).json(latestInvite);
    }

    const invite = await TeamInvite.create({
      email: normalizedEmail,
      invitedBy: req.user._id,
    });

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

    const invite = await TeamInvite.findOne({
      _id: id,
      invitedBy: req.user._id,
    });

    if (!invite) {
      return res.status(404).json({ message: "Convite não encontrado." });
    }

    const previousStatus = invite.status;

    if (previousStatus === "accepted") {
      await TeamInvite.deleteMany({
        invitedBy: req.user._id,
        email: invite.email,
      });
      return res.status(200).json({ message: "Membro removido da equipe com sucesso." });
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
    }).populate("invitedBy", "fullName email");

    if (!invite) {
      return res.status(404).json({ message: "Convite não encontrado." });
    }

    if (invite.status === status) {
      return res.status(200).json(invite);
    }

    if (invite.status === "accepted") {
      return res.status(400).json({
        message: "Este convite já foi aceito. Peça ao proprietário para remover você da equipe.",
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
