import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { ENV } from "../lib/env.js";
import { getAuthCookieOptions } from "../lib/utils.js";
import { sendPasswordResetEmail } from "../lib/email.js";
import {
  isCloudinaryConfigured,
  uploadProfileImageToCloudinary,
} from "../lib/cloudinary.js";

const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_RESET_DEFAULT_TTL_MINUTES = 15;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const buildPasswordResetToken = () => {
  const plainToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(plainToken)
    .digest("hex");

  return { plainToken, hashedToken };
};

const getPasswordResetTokenTtlMs = () => {
  const ttlMinutes = Number.parseInt(
    ENV.PASSWORD_RESET_TOKEN_TTL_MINUTES || "",
    10,
  );
  const safeMinutes =
    Number.isFinite(ttlMinutes) && ttlMinutes > 0
      ? ttlMinutes
      : PASSWORD_RESET_DEFAULT_TTL_MINUTES;

  return safeMinutes * 60 * 1000;
};

const buildPasswordResetUrl = ({ email, token }) => {
  const frontendBaseUrl =
    ENV.FRONTEND_URL?.replace(/\/+$/, "") || "http://localhost:3000";
  const params = new URLSearchParams({
    email,
    token,
  });

  return `${frontendBaseUrl}/reset-password?${params.toString()}`;
};

const forgotPasswordGenericMessage =
  "Se o e-mail estiver cadastrado, enviaremos instruções para redefinir a senha.";

export const signup = async (req, res) => {
  const { fullName, password } = req.body;
  const normalizedEmail = normalizeEmail(req.body?.email);

  try {
    if (!fullName || !normalizedEmail || !password) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres." });
    }

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: "Formato de e-mail inválido." });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (user) return res.status(400).json({ message: "E-mail já cadastrado." });

    const newUser = new User({
      fullName,
      email: normalizedEmail,
      password: await hashPassword(password),
    });

    if (newUser) {
      // before CR:
      // generateToken(newUser._id, res);
      // await newUser.save();

      // after CR:
      // Persist user first, then issue auth cookie
      const savedUser = await newUser.save();
      generateToken(savedUser._id, res);

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Dados de usuário inválidos." });
    }
  } catch (error) {
    console.log("Error in signup controller:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const login = async (req, res) => {
  const { password } = req.body;
  const normalizedEmail = normalizeEmail(req.body?.email);

  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: "Credenciais inválidas." });
    // never tell the client which one is incorrect: password or email

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Credenciais inválidas." });

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const forgotPassword = async (req, res) => {
  const normalizedEmail = normalizeEmail(req.body?.email);
  if (!normalizedEmail) {
    return res.status(400).json({ message: "E-mail é obrigatório." });
  }

  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ message: "Formato de e-mail inválido." });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(200).json({ message: forgotPasswordGenericMessage });
    }

    const { plainToken, hashedToken } = buildPasswordResetToken();
    const resetUrl = buildPasswordResetUrl({ email: user.email, token: plainToken });

    user.passwordResetTokenHash = hashedToken;
    user.passwordResetExpiresAt = new Date(Date.now() + getPasswordResetTokenTtlMs());
    await user.save();

    const emailResult = await sendPasswordResetEmail({
      to: user.email,
      fullName: user.fullName,
      resetUrl,
      token: plainToken,
    });

    const responsePayload: Record<string, string> = {
      message: forgotPasswordGenericMessage,
    };
    if (ENV.NODE_ENV !== "production") {
      responsePayload.devResetToken = plainToken;
      responsePayload.devResetUrl = resetUrl;
      responsePayload.devEmailStatus = emailResult.sent ? "sent" : "not-sent";
    }

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error("Error in forgotPassword controller:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const resetPassword = async (req, res) => {
  const normalizedEmail = normalizeEmail(req.body?.email);
  const token = String(req.body?.token || "").trim();
  const newPassword = String(req.body?.newPassword || "");

  if (!normalizedEmail || !token || !newPassword) {
    return res
      .status(400)
      .json({ message: "E-mail, token e nova senha são obrigatórios." });
  }

  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ message: "Formato de e-mail inválido." });
  }

  if (newPassword.length < PASSWORD_MIN_LENGTH) {
    return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres." });
  }

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      email: normalizedEmail,
      passwordResetTokenHash: hashedToken,
      passwordResetExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token inválido ou expirado." });
    }

    user.password = await hashPassword(newPassword);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    res.status(200).json({ message: "Senha redefinida com sucesso." });
  } catch (error) {
    console.error("Error in resetPassword controller:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const changePassword = async (req, res) => {
  const currentPassword = String(req.body?.currentPassword || "");
  const newPassword = String(req.body?.newPassword || "");

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Senha atual e nova senha são obrigatórias." });
  }

  if (newPassword.length < PASSWORD_MIN_LENGTH) {
    return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres." });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({ message: "Senha atual incorreta." });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res
        .status(400)
        .json({ message: "A nova senha deve ser diferente da senha atual." });
    }

    user.password = await hashPassword(newPassword);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    res.status(200).json({ message: "Senha alterada com sucesso." });
  } catch (error) {
    console.error("Error in changePassword controller:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const logout = (_, res) => {
  res.cookie("jwt", "", {
    maxAge: 0,
    ...getAuthCookieOptions(),
  });
  res.status(200).json({ message: "Logout realizado com sucesso." });
};

// No Controller (auth.controller.js)
export const updateProfile = async (req, res) => {
  try {
    const { fullName, profilePic } = req.body;
    const userId = req.user._id;
    const updateData: Record<string, string> = {};

    if (typeof fullName === "string") {
      const normalizedFullName = fullName.trim();

      if (!normalizedFullName) {
        return res.status(400).json({ message: "Nome completo é obrigatório." });
      }

      updateData.fullName = normalizedFullName;
    }

    if (typeof profilePic === "string") {
      const normalizedProfilePic = profilePic.trim();

      if (normalizedProfilePic) {
        try {
          const parsedUrl = new URL(normalizedProfilePic);
          if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            return res.status(400).json({ message: "URL da foto de perfil inválida." });
          }
        } catch {
          return res.status(400).json({ message: "URL da foto de perfil inválida." });
        }
      }

      updateData.profilePic = normalizedProfilePic;
    }

    if (!Object.keys(updateData).length) {
      return res.status(400).json({ message: "Nenhum dado válido para atualizar." });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar perfil." });
  }
};

export const uploadProfilePicture = async (req, res) => {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        message: "Cloudinary não configurado no servidor.",
      });
    }

    if (!req.file?.buffer) {
      return res.status(400).json({ message: "Selecione uma imagem para enviar." });
    }

    const userId = req.user._id.toString();
    const uploadResult = (await uploadProfileImageToCloudinary(
      req.file.buffer,
      userId,
    )) as { secure_url: string };
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profilePic: uploadResult.secure_url },
      { new: true },
    ).select("-password");

    res.status(200).json({
      profilePic: updatedUser?.profilePic || "",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in uploadProfilePicture controller:", error);
    res.status(500).json({ message: "Erro ao enviar imagem de perfil." });
  }
};
