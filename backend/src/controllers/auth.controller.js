import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { ENV } from "../lib/env.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres." });
    }

    // check if emailis valid: regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Formato de e-mail inválido." });
    }

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "E-mail já cadastrado." });

    // 123456 => $dnjasdkasj_?dmsakmk
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
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

      try {
        await sendWelcomeEmail(savedUser.email, savedUser.fullName, ENV.CLIENT_URL);
      } catch (error) {
        console.error("Failed to send welcome email:", error);
      }
    } else {
      res.status(400).json({ message: "Dados de usuário inválidos." });
    }
  } catch (error) {
    console.log("Error in signup controller:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
  }

  try {
    const user = await User.findOne({ email });
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

export const logout = (_, res) => {
  const isProduction = ENV.NODE_ENV === "production";
  res.cookie("jwt", "", {
    maxAge: 0,
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  });
  res.status(200).json({ message: "Logout realizado com sucesso." });
};

// No Controller (auth.controller.js)
export const updateProfile = async (req, res) => {
  try {
    const { fullName } = req.body;
    const userId = req.user._id; // Assumindo que você tem o middleware de proteção

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName },
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar perfil." });
  }
};
