const Task = require("../models/Task");

const getTasks = async (req, res) => {
  const tasks = await Task.find({ user: req.user });
  res.json(tasks);
};

const createTask = async (req, res) => {
  const { title, description, status } = req.body;
  const task = await Task.create({
    title,
    description,
    status,
    user: req.user,
  });
  res.status(201).json(task);
};

const updateTask = async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(task);
};

const deleteTask = async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Tarefa deletada" });
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
