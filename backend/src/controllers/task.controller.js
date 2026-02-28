import Task from "../models/Task.js";

export const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Busca tarefas que pertencem ao projeto X E ao usuário logado
    const tasks = await Task.find({ 
      project: projectId, 
      user: req.user._id 
    }).sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar tarefas." });
  }
};

export const createTask = async (req, res) => {
  try {
    // O campo 'project' vem do frontend agora
    const { title, description, project } = req.body;

    if (!title || !project) {
      return res.status(400).json({ message: "Título e Projeto são obrigatórios." });
    }

    const newTask = new Task({
      title,
      description,
      project, // ID do projeto vindo do frontend
      user: req.user._id, // ID do usuário logado
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Erro ao criar tarefa:", error.message);
    res.status(500).json({ message: "Erro interno ao criar tarefa." });
  }
};

export const updateTask = async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(task);
};

export const deleteTask = async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Tarefa deletada" });
};
