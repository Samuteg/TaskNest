import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import { connectDB } from "./config/db.js";


import authRoutes from "./routes/auth.route.js";
import taskRoutes from "./routes/task.route.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Rota de teste
app.get('/', (req, res) => res.send('API de Tarefas rodando! 🚀'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));