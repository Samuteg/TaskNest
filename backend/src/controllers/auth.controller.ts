import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { ENV } from "../lib/env.js";
import { sendPasswordResetEmail } from "../lib/email.js";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/betterAuth.js";
import {
  isCloudinaryConfigured,
  uploadProfileImageToCloudinary,
} from "../lib/cloudinary.js";

const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_RESET_DEFAULT_TTL_MINUTES = 15;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

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

export const signup = async (request, reply) => {
  const { fullName, password } = request.body;
  const normalizedEmail = normalizeEmail(request.body?.email);

  try {
    if (!fullName || !normalizedEmail || !password) {
      return reply
        .code(400)
        .send({ message: "Todos os campos são obrigatórios." });
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return reply
        .code(400)
        .send({ message: "A senha deve ter pelo menos 6 caracteres." });
    }

    if (!emailRegex.test(normalizedEmail)) {
      return reply.code(400).send({ message: "Formato de e-mail inválido." });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (user) return reply.code(400).send({ message: "E-mail já cadastrado." });

    const newUser = new User({
      fullName,
      email: normalizedEmail,
      password: await hashPassword(password),
    });

    if (newUser) {
      // Persist user first, then issue auth cookie
      await newUser.save();
      const authResponse = await (auth as any).api.signUpEmail({
        body: {
          email: normalizedEmail,
          password,
          name: fullName,
        },
        headers: fromNodeHeaders(request.headers),
        asResponse: true,
      });
      const setCookie = authResponse.headers.get("set-cookie");
      if (setCookie) {
        reply.header("set-cookie", setCookie);
      }

      reply.code(201).send({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      reply.code(400).send({ message: "Dados de usuário inválidos." });
    }
  } catch (error) {
    console.log("Error in signup controller:", error);
    reply.code(500).send({ message: "Erro interno do servidor." });
  }
};

export const login = async (request, reply) => {
  const { password } = request.body;
  const normalizedEmail = normalizeEmail(request.body?.email);

  if (!normalizedEmail || !password) {
    return reply
      .code(400)
      .send({ message: "E-mail e senha são obrigatórios." });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user)
      return reply.code(400).send({ message: "Credenciais inválidas." });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return reply.code(400).send({ message: "Credenciais inválidas." });

    const authResponse = await (auth as any).api.signInEmail({
      body: {
        email: normalizedEmail,
        password,
      },
      headers: fromNodeHeaders(request.headers),
      asResponse: true,
    });
    const setCookie = authResponse.headers.get("set-cookie");
    if (setCookie) {
      reply.header("set-cookie", setCookie);
    }

    reply.send({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    reply.code(500).send({ message: "Erro interno do servidor." });
  }
};

export const forgotPassword = async (request, reply) => {
  const normalizedEmail = normalizeEmail(request.body?.email);
  if (!normalizedEmail) {
    return reply.code(400).send({ message: "E-mail é obrigatório." });
  }

  if (!emailRegex.test(normalizedEmail)) {
    return reply.code(400).send({ message: "Formato de e-mail inválido." });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return reply.send({ message: forgotPasswordGenericMessage });
    }

    const { plainToken, hashedToken } = buildPasswordResetToken();
    const resetUrl = buildPasswordResetUrl({
      email: user.email,
      token: plainToken,
    });

    user.passwordResetTokenHash = hashedToken;
    user.passwordResetExpiresAt = new Date(
      Date.now() + getPasswordResetTokenTtlMs(),
    );
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

    reply.send(responsePayload);
  } catch (error) {
    console.error("Error in forgotPassword controller:", error);
    reply.code(500).send({ message: "Erro interno do servidor." });
  }
};

export const resetPassword = async (request, reply) => {
  const normalizedEmail = normalizeEmail(request.body?.email);
  const token = String(request.body?.token || "").trim();
  const newPassword = String(request.body?.newPassword || "");

  if (!normalizedEmail || !token || !newPassword) {
    return reply
      .code(400)
      .send({ message: "E-mail, token e nova senha são obrigatórios." });
  }

  if (!emailRegex.test(normalizedEmail)) {
    return reply.code(400).send({ message: "Formato de e-mail inválido." });
  }

  if (newPassword.length < PASSWORD_MIN_LENGTH) {
    return reply
      .code(400)
      .send({ message: "A senha deve ter pelo menos 6 caracteres." });
  }

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      email: normalizedEmail,
      passwordResetTokenHash: hashedToken,
      passwordResetExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return reply.code(400).send({ message: "Token inválido ou expirado." });
    }

    user.password = await hashPassword(newPassword);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    reply.send({ message: "Senha redefinida com sucesso." });
  } catch (error) {
    console.error("Error in resetPassword controller:", error);
    reply.code(500).send({ message: "Erro interno do servidor." });
  }
};

export const changePassword = async (request, reply) => {
  const currentPassword = String(request.body?.currentPassword || "");
  const newPassword = String(request.body?.newPassword || "");

  if (!currentPassword || !newPassword) {
    return reply
      .code(400)
      .send({ message: "Senha atual e nova senha são obrigatórias." });
  }

  if (newPassword.length < PASSWORD_MIN_LENGTH) {
    return reply
      .code(400)
      .send({ message: "A senha deve ter pelo menos 6 caracteres." });
  }

  try {
    const user = await User.findById(request.user._id);
    if (!user) {
      return reply.code(404).send({ message: "Usuário não encontrado." });
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordCorrect) {
      return reply.code(400).send({ message: "Senha atual incorreta." });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return reply
        .code(400)
        .send({ message: "A nova senha deve ser diferente da senha atual." });
    }

    user.password = await hashPassword(newPassword);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    reply.send({ message: "Senha alterada com sucesso." });
  } catch (error) {
    console.error("Error in changePassword controller:", error);
    reply.code(500).send({ message: "Erro interno do servidor." });
  }
};

export const logout = (request, reply) => {
  Promise.resolve(
    (auth as any).api.signOut({
      headers: fromNodeHeaders(request.headers),
      asResponse: true,
    }),
  )
    .then((authResponse) => {
      const setCookie = authResponse.headers.get("set-cookie");
      if (setCookie) {
        reply.header("set-cookie", setCookie);
      }
      reply.send({ message: "Logout realizado com sucesso." });
    })
    .catch(() => {
      reply.send({ message: "Logout realizado com sucesso." });
    });
};

export const updateProfile = async (request, reply) => {
  try {
    const { fullName, profilePic } = request.body;
    const userId = request.user._id;
    const updateData: Record<string, string> = {};

    if (typeof fullName === "string") {
      const normalizedFullName = fullName.trim();

      if (!normalizedFullName) {
        return reply
          .code(400)
          .send({ message: "Nome completo é obrigatório." });
      }

      updateData.fullName = normalizedFullName;
    }

    if (typeof profilePic === "string") {
      const normalizedProfilePic = profilePic.trim();

      if (normalizedProfilePic) {
        try {
          const parsedUrl = new URL(normalizedProfilePic);
          if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            return reply
              .code(400)
              .send({ message: "URL da foto de perfil inválida." });
          }
        } catch {
          return reply
            .code(400)
            .send({ message: "URL da foto de perfil inválida." });
        }
      }

      updateData.profilePic = normalizedProfilePic;
    }

    if (!Object.keys(updateData).length) {
      return reply
        .code(400)
        .send({ message: "Nenhum dado válido para atualizar." });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    reply.send(updatedUser);
  } catch (error) {
    reply.code(500).send({ message: "Erro ao atualizar perfil." });
  }
};

export const uploadProfilePicture = async (request, reply) => {
  try {
    if (!isCloudinaryConfigured()) {
      return reply.code(503).send({
        message: "Cloudinary não configurado no servidor.",
      });
    }

    if (!request.fileBuffer) {
      return reply
        .code(400)
        .send({ message: "Selecione uma imagem para enviar." });
    }

    const userId = request.user._id.toString();
    const uploadResult = (await uploadProfileImageToCloudinary(
      request.fileBuffer,
      userId,
    )) as { secure_url: string };
    const updatedUser = await User.findByIdAndUpdate(
      request.user._id,
      { profilePic: uploadResult.secure_url },
      { new: true },
    ).select("-password");

    reply.send({
      profilePic: updatedUser?.profilePic || "",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in uploadProfilePicture controller:", error);
    reply.code(500).send({ message: "Erro ao enviar imagem de perfil." });
  }
};
