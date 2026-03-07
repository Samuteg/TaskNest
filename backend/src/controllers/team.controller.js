import TeamInvite from "../models/teamInvite.model.js";

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

    const existingInvite = await TeamInvite.findOne({
      invitedBy: req.user._id,
      email: normalizedEmail,
      status: "pending",
    });

    if (existingInvite) {
      return res.status(409).json({
        message: "Já existe um convite pendente para este e-mail.",
      });
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
