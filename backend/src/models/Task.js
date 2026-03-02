import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    order: {
      type: Number,
      default: 0,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Dentro do seu taskSchema, adicione esta linha:
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  },
  { timestamps: true },
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
