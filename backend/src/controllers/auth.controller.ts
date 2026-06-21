import { auth, mongoDb } from "../lib/betterAuth.js";
import { ENV } from "./../lib/env.js";
import { isCloudinaryConfigured, uploadProfileImageToCloudinary } from "../lib/cloudinary.js";

export const forgotPassword = async (request, reply) => {
  const email = request.body?.email;
  if (!email) {
    return reply.code(400).send({ message: "E-mail é obrigatório." });
  }
  try {
    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: `${ENV.FRONTEND_URL || "http://localhost:3000"}/reset-password`,
      },
    });

    const responsePayload: Record<string, string> = {
      message: "Se o e-mail estiver cadastrado, um link de redefinição foi enviado.",
    };

    if (ENV.NODE_ENV !== "production") {
      const verification = await mongoDb.collection("verifications").findOne(
        { identifier: { $regex: /^reset-password:/ } },
        { sort: { createdAt: -1, _id: -1 } },
      );
      if (verification) {
        const token = (verification.identifier as string).replace("reset-password:", "");
        responsePayload.devResetToken = token;
      }
    }

    reply.send(responsePayload);
  } catch (error) {
    console.error("Error in forgotPassword controller:", error);
    reply.code(500).send({ message: "Erro interno do servidor." });
  }
};

export const resetPassword = async (request, reply) => {
  const token = request.body?.token;
  const newPassword = request.body?.newPassword;

  if (!token || !newPassword) {
    return reply
      .code(400)
      .send({ message: "Token e nova senha são obrigatórios." });
  }

  if (newPassword.length < 6) {
    return reply
      .code(400)
      .send({ message: "A senha deve ter pelo menos 6 caracteres." });
  }

  try {
    await auth.api.resetPassword({
      body: {
        newPassword,
        token,
      },
    });
    reply.send({ message: "Senha redefinida com sucesso." });
  } catch (error) {
    console.error("Error in resetPassword controller:", error);
    reply.code(400).send({ message: error.message || "Erro ao redefinir senha." });
  }
};

export const changePassword = async (request, reply) => {
  const currentPassword = request.body?.currentPassword;
  const newPassword = request.body?.newPassword;

  if (!currentPassword || !newPassword) {
    return reply
      .code(400)
      .send({ message: "Senha atual e nova senha são obrigatórias." });
  }

  if (newPassword.length < 6) {
    return reply
      .code(400)
      .send({ message: "A senha deve ter pelo menos 6 caracteres." });
  }

  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(request.headers)) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else if (value !== undefined) {
        headers.set(key, value as string);
      }
    }

    await auth.api.changePassword({
      headers,
      body: {
        currentPassword,
        newPassword,
      },
    });

    reply.send({ message: "Senha alterada com sucesso." });
  } catch (error) {
    console.error("Error in changePassword controller:", error);
    reply.code(400).send({ message: error.message || "Erro ao alterar senha." });
  }
};

export const updateProfile = async (request, reply) => {
  try {
    const { fullName, profilePic } = request.body;
    const updateBody: Record<string, string> = {};

    if (typeof fullName === "string") {
      const normalizedFullName = fullName.trim();
      if (!normalizedFullName) {
        return reply
          .code(400)
          .send({ message: "Nome completo é obrigatório." });
      }
      updateBody.name = normalizedFullName;
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
      updateBody.image = normalizedProfilePic;
    }

    if (!Object.keys(updateBody).length) {
      return reply
        .code(400)
        .send({ message: "Nenhum dada válido para atualizar." });
    }

    const headers = new Headers();
    for (const [key, value] of Object.entries(request.headers)) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else if (value !== undefined) {
        headers.set(key, value as string);
      }
    }

    const updatedUser = await auth.api.updateUser({
      headers,
      body: updateBody,
    });

    reply.send({
      ...updatedUser,
      _id: updatedUser.id,
      fullName: updatedUser.name,
      profilePic: updatedUser.image,
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
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

    const headers = new Headers();
    for (const [key, value] of Object.entries(request.headers)) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else if (value !== undefined) {
        headers.set(key, value as string);
      }
    }

    const updatedUser = await auth.api.updateUser({
      headers,
      body: {
        image: uploadResult.secure_url,
      },
    });

    reply.send({
      profilePic: updatedUser.image,
      user: {
        ...updatedUser,
        _id: updatedUser.id,
        fullName: updatedUser.name,
        profilePic: updatedUser.image,
      },
    });
  } catch (error) {
    console.error("Error in uploadProfilePicture controller:", error);
    reply.code(500).send({ message: "Erro ao enviar imagem de perfil." });
  }
};
