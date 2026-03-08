import React, { useState, useEffect } from "react";
import { X, Loader2, Plus, Trash2, ListChecks } from "lucide-react";
import { apiUrl } from "../lib/api";

const statusOptions = [
  { value: "todo", label: "Pendente", dot: "bg-amber-400" },
  { value: "in-progress", label: "Em progresso", dot: "bg-fuchsia-400" },
  { value: "done", label: "Concluída", dot: "bg-emerald-400" },
];
const priorityOptions = [
  { value: "low", label: "Baixa", dot: "bg-sky-400" },
  { value: "medium", label: "Média", dot: "bg-amber-400" },
  { value: "high", label: "Alta", dot: "bg-red-400" },
];

type TaskStatus = "todo" | "in-progress" | "done";
type TaskPriority = "low" | "medium" | "high";
type TaskChecklistItem = { text?: string; done?: boolean };
type TaskToEdit = {
  _id: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | Date | null;
  assignee?: string;
  checklist?: TaskChecklistItem[];
};
type TaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string | null;
  taskToEdit: TaskToEdit | null;
};

const TaskModal = ({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  taskToEdit,
}: TaskModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [assignee, setAssignee] = useState("");
  const [checklist, setChecklist] = useState<Array<{ text: string; done: boolean }>>(
    [],
  );
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const toInputDate = (dateValue: unknown) => {
    if (!dateValue) return "";
    const parsed = new Date(String(dateValue));
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toISOString().slice(0, 10);
  };

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || "");
      setStatus(taskToEdit.status || "todo");
      setPriority(taskToEdit.priority || "medium");
      setDueDate(toInputDate(taskToEdit.dueDate));
      setAssignee(taskToEdit.assignee || "");
      setChecklist(
        Array.isArray(taskToEdit.checklist)
          ? taskToEdit.checklist
              .map((item: { text?: unknown; done?: unknown }) => ({
                text: typeof item?.text === "string" ? item.text : "",
                done: Boolean(item?.done),
              }))
              .filter(
                (item: { text: string; done: boolean }) =>
                  item.text.trim().length > 0,
              )
          : [],
      );
    } else {
      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("medium");
      setDueDate("");
      setAssignee("");
      setChecklist([]);
    }
    setNewChecklistItem("");
    setError("");
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    setIsLoading(true);
    setError("");
    const normalizedChecklist = checklist
      .map((item) => ({
        text: item.text.trim(),
        done: Boolean(item.done),
      }))
      .filter((item) => item.text.length > 0)
      .slice(0, 30);
    try {
      const url = taskToEdit
        ? apiUrl(`/api/tasks/${taskToEdit._id}`)
        : apiUrl("/api/tasks");
      const res = await fetch(url, {
        method: taskToEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          status,
          priority,
          dueDate: dueDate || null,
          assignee,
          checklist: normalizedChecklist,
          project: projectId,
        }),
        credentials: "include",
      });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        setError(data.message || "Erro ao salvar tarefa.");
      }
    } catch {
      setError("Erro de conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddChecklistItem = () => {
    const text = newChecklistItem.trim();
    if (!text) return;
    if (checklist.length >= 30) return;
    setChecklist((prev) => [...prev, { text, done: false }]);
    setNewChecklistItem("");
  };

  const handleChecklistItemToggle = (index: number) => {
    setChecklist((prev) =>
      prev.map((item, currentIndex) =>
        currentIndex === index ? { ...item, done: !item.done } : item,
      ),
    );
  };

  const handleChecklistItemTextChange = (index: number, text: string) => {
    setChecklist((prev) =>
      prev.map((item, currentIndex) =>
        currentIndex === index ? { ...item, text } : item,
      ),
    );
  };

  const handleChecklistItemRemove = (index: number) => {
    setChecklist((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  };

  const inputClass =
    "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-medium text-white placeholder-white/20 outline-none transition-all focus:border-fuchsia-400/40 focus:ring-2 focus:ring-fuchsia-400/10";

  const currentStatus = statusOptions.find((s) => s.value === status);
  const currentPriority = priorityOptions.find((p) => p.value === priority);
  const doneChecklistItems = checklist.filter((item) => item.done).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-mono-dm { font-family: 'DM Mono', monospace; }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      >
        {/* Click-outside */}
        <button
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Card */}
        <div className="font-syne relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.07] bg-[#131316] shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
            <div>
              <div className="font-mono-dm mb-0.5 text-[9px] uppercase tracking-[0.2em] text-fuchsia-400/40">
                {taskToEdit ? "editar tarefa" : "nova tarefa"}
              </div>
              <h2 className="text-base font-extrabold tracking-tight text-white">
                {taskToEdit ? taskToEdit.title : "Criar tarefa"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-white/20 transition-colors hover:bg-white/[0.05] hover:text-white/50"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-h-[72vh] space-y-5 overflow-y-auto p-6">
            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-400">
                <span className="font-bold">Erro: </span>
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="font-mono-dm mb-2 block text-[10px] uppercase tracking-[0.15em] text-white/30">
                Título <span className="text-fuchsia-400/50">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Nome da tarefa"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Description */}
            <div>
              <label className="font-mono-dm mb-2 block text-[10px] uppercase tracking-[0.15em] text-white/30">
                Descrição{" "}
                <span className="text-white/15 normal-case tracking-normal">
                  (opcional)
                </span>
              </label>
              <textarea
                rows={3}
                placeholder="Detalhes da tarefa..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Status */}
              <div>
                <label className="font-mono-dm mb-2 block text-[10px] uppercase tracking-[0.15em] text-white/30">
                  Status
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${currentStatus?.dot}`}
                    />
                  </div>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={`${inputClass} pl-8 appearance-none cursor-pointer`}
                    style={{ backgroundImage: "none" }}
                  >
                    {statusOptions.map(({ value, label }) => (
                      <option
                        key={value}
                        value={value}
                        className="bg-[#131316] text-white"
                      >
                        {label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                      <path
                        d="M1 1L5 5L9 1"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="font-mono-dm mb-2 block text-[10px] uppercase tracking-[0.15em] text-white/30">
                  Prioridade
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${currentPriority?.dot}`}
                    />
                  </div>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className={`${inputClass} pl-8 appearance-none cursor-pointer`}
                    style={{ backgroundImage: "none" }}
                  >
                    {priorityOptions.map(({ value, label }) => (
                      <option
                        key={value}
                        value={value}
                        className="bg-[#131316] text-white"
                      >
                        {label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                      <path
                        d="M1 1L5 5L9 1"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="font-mono-dm mb-2 block text-[10px] uppercase tracking-[0.15em] text-white/30">
                  Prazo
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="font-mono-dm mb-2 block text-[10px] uppercase tracking-[0.15em] text-white/30">
                  Responsável
                </label>
                <input
                  type="text"
                  placeholder="Nome ou e-mail"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className={inputClass}
                  maxLength={120}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="font-mono-dm block text-[10px] uppercase tracking-[0.15em] text-white/30">
                  Checklist
                </label>
                <span className="font-mono-dm text-[10px] text-white/30">
                  {doneChecklistItems}/{checklist.length} concluídos
                </span>
              </div>

              <div className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                {checklist.length === 0 && (
                  <div className="font-mono-dm flex items-center gap-2 text-[11px] text-white/25">
                    <ListChecks size={13} />
                    Sem itens no checklist.
                  </div>
                )}

                {checklist.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => handleChecklistItemToggle(index)}
                      className="h-4 w-4 shrink-0 cursor-pointer accent-fuchsia-500"
                    />
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) =>
                        handleChecklistItemTextChange(index, e.target.value)
                      }
                      className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white outline-none transition-all focus:border-fuchsia-400/40"
                    />
                    <button
                      type="button"
                      onClick={() => handleChecklistItemRemove(index)}
                      className="rounded-lg p-2 text-white/20 transition-colors hover:bg-red-400/10 hover:text-red-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    placeholder="Adicionar item..."
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white placeholder-white/20 outline-none transition-all focus:border-fuchsia-400/40"
                    maxLength={200}
                  />
                  <button
                    type="button"
                    onClick={handleAddChecklistItem}
                    disabled={!newChecklistItem.trim() || checklist.length >= 30}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-semibold text-white/70 transition-colors hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus size={12} />
                    Item
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-white/[0.05] pt-5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/[0.07] px-4 py-2.5 text-sm font-medium text-white/35 transition-all hover:bg-white/[0.04] hover:text-white/60"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-[#4a044e] px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(74,4,78,0.4)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Salvando...
                  </>
                ) : taskToEdit ? (
                  "Salvar alterações"
                ) : (
                  "Criar tarefa"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default TaskModal;
