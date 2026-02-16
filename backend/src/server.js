import express from "express"
import mogoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com MongoDB

// Rota de teste
app.get('/', (req, res) => res.send('API de Tarefas rodando! 🚀'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
