"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import TaskModal from "../components/TaskModal";
import SettingsModal from "../components/SettingsModal";
import { apiUrl } from "../lib/api";
import {
  Trash2,
  Edit3,
  Loader2,
  Plus,
  ArrowLeft,
  Settings,
  GripVertical,
  FolderKanban,
  Calendar,
} from "lucide-react";

export default function HomePage() {
  type TaskItem = {
    _id: string;
    title: string;
    description?: string;
    status: "todo" | "in-progress" | "done";
    createdAt: string;
    order?: number;
  };
  type TaskStatus = TaskItem["status"];

  const kanbanColumns: Array<{
    status: TaskStatus;
    label: string;
    emptyLabel: string;
    accent: string;
    dot: string;
    ring: string;
  }> = [
    {
      status: "todo",
      label: "Pendente",
      emptyLabel: "Sem tarefas pendentes.",
      accent: "text-amber-400",
      dot: "bg-amber-400",
      ring: "border-amber-400/20",
    },
    {
      status: "in-progress",
      label: "Em Progresso",
      emptyLabel: "Sem tarefas em progresso.",
      accent: "text-fuchsia-400",
      dot: "bg-fuchsia-400",
      ring: "border-fuchsia-400/20",
    },
    {
      status: "done",
      label: "Concluídas",
      emptyLabel: "Sem tarefas concluídas.",
      accent: "text-emerald-400",
      dot: "bg-emerald-400",
      ring: "border-emerald-400/20",
    },
  ];

  const cardAccents = [
    "bg-fuchsia-500",
    "bg-violet-500",
    "bg-pink-500",
    "bg-purple-600",
    "bg-rose-500",
  ];

  const formatDate = (dateString: string) => {
    if (!dateString) return "25/01/2026";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const sortTasksByDisplayOrder = (taskList: TaskItem[]) => {
    return [...taskList].sort((a, b) => {
      const aOrder =
        typeof a.order === "number" ? a.order : Number.MAX_SAFE_INTEGER;
      const bOrder =
        typeof b.order === "number" ? b.order : Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const getTasksByStatus = (taskList: TaskItem[], status: TaskStatus) =>
    sortTasksByDisplayOrder(taskList.filter((task) => task.status === status));

  const moveTaskInBoard = (
    taskList: TaskItem[],
    draggedTaskId: string,
    targetStatus: TaskStatus,
    targetTaskId: string | null = null,
  ) => {
    if (targetTaskId && draggedTaskId === targetTaskId) return null;
    const columns = {
      todo: getTasksByStatus(taskList, "todo"),
      "in-progress": getTasksByStatus(taskList, "in-progress"),
      done: getTasksByStatus(taskList, "done"),
    } satisfies Record<TaskStatus, TaskItem[]>;

    const draggedTask = taskList.find((t) => t._id === draggedTaskId);
    if (!draggedTask) return null;

    const sourceTasks = columns[draggedTask.status];
    const sourceIndex = sourceTasks.findIndex((t) => t._id === draggedTaskId);
    if (sourceIndex < 0) return null;
    sourceTasks.splice(sourceIndex, 1);

    const movedTask = { ...draggedTask, status: targetStatus };
    const targetTasks = columns[targetStatus];
    const targetIndex = targetTaskId
      ? targetTasks.findIndex((t) => t._id === targetTaskId)
      : -1;
    if (targetIndex >= 0) targetTasks.splice(targetIndex, 0, movedTask);
    else targetTasks.push(movedTask);

    const normalized = {
      todo: columns.todo.map((t, i) => ({ ...t, order: i })),
      "in-progress": columns["in-progress"].map((t, i) => ({ ...t, order: i })),
      done: columns.done.map((t, i) => ({ ...t, order: i })),
    } satisfies Record<TaskStatus, TaskItem[]>;

    return kanbanColumns.flatMap((col) => normalized[col.status]);
  };

  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true); // always dark to match system

  useEffect(() => {
    const saved = window.localStorage.getItem("tasknest-theme");
    if (saved === "dark") setDarkMode(true);
    else if (saved === "light") setDarkMode(false);
    else setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    window.localStorage.setItem("tasknest-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [currentView, setCurrentView] = useState<"projects" | "tasks" | "team">(
    "projects",
  );
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);
  const [isReorderingTasks, setIsReorderingTasks] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  const activeProject: any = projects.find(
    (p: any) => p._id === activeProjectId,
  );

  const fetchUserData = async () => {
    try {
      const res = await fetch(apiUrl("/api/auth/check"), {
        credentials: "include",
      });
      if (res.ok) setUser(await res.json());
      else router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch(apiUrl("/api/projects"), {
        credentials: "include",
      });
      if (res.ok) setProjects(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async (projId: string) => {
    try {
      const res = await fetch(apiUrl(`/api/tasks/${projId}`), {
        credentials: "include",
      });
      if (res.ok) setTasks(sortTasksByDisplayOrder(await res.json()));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchUserData();
      await fetchProjects();
      setLoading(false);
    };
    init();
  }, [router]);

  useEffect(() => {
    if (activeProjectId) fetchTasks(activeProjectId);
  }, [activeProjectId]);

  const handleCreateProject = async () => {
    const name = window.prompt("Nome do novo projeto:");
    if (!name) return;
    try {
      await fetch(apiUrl("/api/projects"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
        credentials: "include",
      });
      fetchProjects();
    } catch {}
  };

  const handleDeleteProject = async (
    projectId: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (!window.confirm("Excluir projeto e todas as tarefas?")) return;
    try {
      await fetch(apiUrl(`/api/projects/${projectId}`), {
        method: "DELETE",
        credentials: "include",
      });
      if (activeProjectId === projectId) setCurrentView("projects");
      fetchProjects();
    } catch {}
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Excluir esta tarefa?")) return;
    try {
      await fetch(apiUrl(`/api/tasks/${taskId}`), {
        method: "DELETE",
        credentials: "include",
      });
      if (activeProjectId) fetchTasks(activeProjectId);
    } catch {}
  };

  const handleLogout = async () => {
    await fetch(apiUrl("/api/auth/logout"), {
      method: "POST",
      credentials: "include",
    });
    router.push("/login");
  };

  const openProject = (projectId: string) => {
    setActiveProjectId(projectId);
    setCurrentView("tasks");
  };

  const persistTasksBoard = async (
    updatedTasks: TaskItem[],
    previousTasks: TaskItem[],
  ) => {
    const prevById = new Map(previousTasks.map((t) => [t._id, t]));
    const changed = updatedTasks.filter((t) => {
      const prev = prevById.get(t._id);
      return (
        !prev ||
        prev.status !== t.status ||
        (prev.order ?? -1) !== (t.order ?? -1)
      );
    });
    if (!changed.length) return;
    const responses = await Promise.all(
      changed.map((t) =>
        fetch(apiUrl(`/api/tasks/${t._id}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: t.status, order: t.order ?? 0 }),
          credentials: "include",
        }),
      ),
    );
    if (responses.some((r) => !r.ok))
      throw new Error("Não foi possível persistir o quadro Kanban.");
  };

  const handleTaskDragStart = (
    e: React.DragEvent<HTMLElement>,
    taskId: string,
  ) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", taskId);
    setDraggedTaskId(taskId);
  };

  const handleTaskDragOverTask = (
    e: React.DragEvent<HTMLElement>,
    taskStatus: TaskStatus,
    taskId: string,
  ) => {
    e.preventDefault();
    if (!draggedTaskId) return;
    if (taskId !== dragOverTaskId || taskStatus !== dragOverStatus) {
      setDragOverTaskId(taskId);
      setDragOverStatus(taskStatus);
    }
  };

  const handleTaskDragOverColumn = (
    e: React.DragEvent<HTMLElement>,
    taskStatus: TaskStatus,
  ) => {
    e.preventDefault();
    if (!draggedTaskId) return;
    if (taskStatus !== dragOverStatus || dragOverTaskId !== null) {
      setDragOverStatus(taskStatus);
      setDragOverTaskId(null);
    }
  };

  const handleTaskDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverTaskId(null);
    setDragOverStatus(null);
  };

  const handleTaskDrop = async (
    e: React.DragEvent<HTMLElement>,
    targetStatus: TaskStatus,
    targetTaskId: string | null = null,
  ) => {
    e.preventDefault();
    if (!draggedTaskId) return;
    const previousTasks = tasks;
    const reorderedTasks = moveTaskInBoard(
      tasks,
      draggedTaskId,
      targetStatus,
      targetTaskId,
    );
    setDraggedTaskId(null);
    setDragOverTaskId(null);
    setDragOverStatus(null);
    if (!reorderedTasks || !activeProjectId) return;
    setTasks(reorderedTasks);
    setIsReorderingTasks(true);
    try {
      await persistTasksBoard(reorderedTasks, previousTasks);
    } catch (err) {
      console.error("Erro ao guardar Kanban:", err);
      fetchTasks(activeProjectId);
    } finally {
      setIsReorderingTasks(false);
    }
  };

  // ── Loading state ──
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-[#0d0d0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4a044e]">
            <FolderKanban size={20} className="text-white" />
          </div>
          <Loader2 className="animate-spin text-fuchsia-400" size={24} />
        </div>
      </div>
    );

  if (!user) return null;

  // ── Shared styles ──
  const sectionTitle =
    "font-syne text-2xl font-extrabold tracking-tight text-white";
  const sectionSubtitle = "font-mono-dm text-xs text-white/30 mt-1";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-mono-dm { font-family: 'DM Mono', monospace; }

        .grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        .task-card { transition: border-color 0.15s, box-shadow 0.15s, opacity 0.15s, transform 0.15s; }
        .task-card:hover { transform: translateY(-1px); }

        .project-card { transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s; }
        .project-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(74,4,78,0.2); }

        .btn-fuchsia { transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s; }
        .btn-fuchsia:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 0 20px rgba(74,4,78,0.4); }
        .btn-fuchsia:active { transform: scale(0.97); }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
      `}</style>

      <div className="font-syne flex min-h-screen bg-[#0d0d0f] text-white">
        <div className="grid-bg flex min-h-screen w-full">
          {/* ── SIDEBAR (passthrough) ── */}
          <Sidebar
            user={user}
            onLogout={handleLogout}
            onOpenSettings={() => setIsSettingsOpen(true)}
            currentView={currentView}
            setCurrentView={setCurrentView}
          />

          {/* ── MAIN ── */}
          <main className="flex-1 overflow-y-auto h-screen px-6 py-8 md:px-10">
            <div className="mx-auto max-w-6xl">
              {/* ════════════════════════════
                  VIEW: PROJECTS
              ════════════════════════════ */}
              {currentView === "projects" && (
                <>
                  {/* Header */}
                  <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-mono-dm mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-fuchsia-400/50">
                        <span className="h-px w-4 bg-fuchsia-400/30" />
                        área de trabalho
                      </div>
                      <h1 className={sectionTitle}>Meus Projetos</h1>
                      <p className={sectionSubtitle}>
                        Bem-vindo, {user.fullName}. Selecione ou crie um
                        projeto.
                      </p>
                    </div>
                    <button
                      onClick={handleCreateProject}
                      className="btn-fuchsia inline-flex items-center gap-2 rounded-xl bg-[#4a044e] px-5 py-3 text-sm font-bold text-white"
                    >
                      <Plus size={16} /> Novo Projeto
                    </button>
                  </div>

                  {/* Project grid */}
                  {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.07] py-20 text-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03]">
                        <FolderKanban size={24} className="text-white/20" />
                      </div>
                      <p className="font-mono-dm text-xs text-white/25 uppercase tracking-widest mb-4">
                        Nenhum projeto ainda
                      </p>
                      <button
                        onClick={handleCreateProject}
                        className="btn-fuchsia inline-flex items-center gap-2 rounded-xl bg-[#4a044e] px-4 py-2.5 text-sm font-bold text-white"
                      >
                        <Plus size={14} /> Criar primeiro projeto
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {projects.map((proj: any, index: number) => {
                        const accent = cardAccents[index % cardAccents.length];
                        return (
                          <div
                            key={proj._id}
                            onClick={() => openProject(proj._id)}
                            className="project-card group relative cursor-pointer overflow-hidden rounded-2xl border border-white/[0.06] bg-[#131316]"
                          >
                            {/* Top accent bar */}
                            <div className={`h-[3px] w-full ${accent}`} />

                            <div className="p-5">
                              <div className="mb-4 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-white font-extrabold text-lg ${accent}`}
                                  >
                                    {proj.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-white truncate max-w-[160px]">
                                      {proj.name}
                                    </h3>
                                    <div className="font-mono-dm mt-0.5 flex items-center gap-1 text-[10px] text-white/25">
                                      <Calendar size={9} />
                                      {formatDate(proj.createdAt)}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={(e) =>
                                    handleDeleteProject(proj._id, e)
                                  }
                                  className="rounded-lg p-1.5 text-white/15 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>

                              <p className="text-xs text-white/25 line-clamp-2 mb-5">
                                Clique para gerenciar as tarefas deste projeto.
                              </p>

                              <div className="flex items-center justify-between">
                                <span className="font-mono-dm text-[10px] text-white/15 uppercase tracking-wider">
                                  acesso rápido
                                </span>
                                <span className="font-mono-dm text-[10px] text-fuchsia-400/50 transition-all group-hover:text-fuchsia-400 group-hover:translate-x-0.5">
                                  Abrir →
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* ════════════════════════════
                  VIEW: TASKS / KANBAN
              ════════════════════════════ */}
              {currentView === "tasks" && activeProjectId && (
                <>
                  {/* Back */}
                  <button
                    onClick={() => setCurrentView("projects")}
                    className="mb-8 group inline-flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-white/35 transition-all hover:border-white/[0.12] hover:text-white/60"
                  >
                    <ArrowLeft
                      size={13}
                      className="transition-transform group-hover:-translate-x-0.5"
                    />
                    Voltar aos projetos
                  </button>

                  {/* Header */}
                  <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                      <div className="font-mono-dm mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-fuchsia-400/50">
                        <span className="h-px w-4 bg-fuchsia-400/30" />
                        kanban
                      </div>
                      <h1 className={sectionTitle}>{activeProject?.name}</h1>
                      <p className={sectionSubtitle}>
                        Arraste tarefas entre colunas para atualizar o status.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {isReorderingTasks && (
                        <span className="font-mono-dm inline-flex items-center gap-1.5 text-[10px] text-fuchsia-400/50">
                          <Loader2 size={12} className="animate-spin" />{" "}
                          Salvando…
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setEditingTask(null);
                          setIsTaskModalOpen(true);
                        }}
                        className="btn-fuchsia inline-flex items-center gap-2 rounded-xl bg-[#4a044e] px-5 py-3 text-sm font-bold text-white"
                      >
                        <Plus size={16} /> Nova Tarefa
                      </button>
                    </div>
                  </div>

                  {/* Kanban board */}
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {kanbanColumns.map((column) => {
                      const columnTasks = getTasksByStatus(
                        tasks,
                        column.status,
                      );
                      const isColDragOver =
                        dragOverStatus === column.status && !dragOverTaskId;

                      return (
                        <div
                          key={column.status}
                          onDragOver={(e) =>
                            handleTaskDragOverColumn(e, column.status)
                          }
                          onDrop={(e) => handleTaskDrop(e, column.status)}
                          className={`rounded-2xl border bg-[#131316] transition-all ${
                            isColDragOver
                              ? `border-[#4a044e]/50 ring-1 ring-[#4a044e]/20`
                              : "border-white/[0.06]"
                          }`}
                        >
                          {/* Column header */}
                          <div className="flex items-center justify-between border-b border-white/[0.05] px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${column.dot}`}
                              />
                              <span className="font-mono-dm text-[11px] font-medium uppercase tracking-[0.12em] text-white/50">
                                {column.label}
                              </span>
                            </div>
                            <span
                              className={`font-mono-dm rounded-full border px-2 py-0.5 text-[10px] font-medium ${column.ring} ${column.accent}`}
                            >
                              {columnTasks.length}
                            </span>
                          </div>

                          {/* Tasks */}
                          <div className="min-h-[260px] space-y-2 p-3">
                            {columnTasks.length > 0 ? (
                              columnTasks.map((task) => {
                                const isDragging = draggedTaskId === task._id;
                                const isDragOver =
                                  dragOverTaskId === task._id &&
                                  draggedTaskId !== task._id;

                                return (
                                  <article
                                    key={task._id}
                                    draggable
                                    onDragStart={(e) =>
                                      handleTaskDragStart(e, task._id)
                                    }
                                    onDragOver={(e) => {
                                      e.stopPropagation();
                                      handleTaskDragOverTask(
                                        e,
                                        column.status,
                                        task._id,
                                      );
                                    }}
                                    onDrop={(e) => {
                                      e.stopPropagation();
                                      handleTaskDrop(
                                        e,
                                        column.status,
                                        task._id,
                                      );
                                    }}
                                    onDragEnd={handleTaskDragEnd}
                                    className={`task-card group cursor-move rounded-xl border bg-[#0d0d0f] p-4 ${
                                      isDragging
                                        ? "opacity-50 border-[#4a044e]/40"
                                        : isDragOver
                                          ? "border-[#4a044e]/60 ring-1 ring-[#4a044e]/20"
                                          : "border-white/[0.06] hover:border-white/[0.12]"
                                    }`}
                                  >
                                    <div className="flex items-start gap-2.5">
                                      <GripVertical
                                        size={14}
                                        className="mt-0.5 shrink-0 text-white/10"
                                      />
                                      <div className="min-w-0 flex-1">
                                        <h3
                                          className={`text-sm font-bold leading-snug ${
                                            task.status === "done"
                                              ? "line-through text-white/20"
                                              : "text-white/80"
                                          }`}
                                        >
                                          {task.title}
                                        </h3>
                                        {task.description && (
                                          <p className="mt-1.5 text-xs leading-relaxed text-white/25 line-clamp-2">
                                            {task.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-3 flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                      <button
                                        onClick={() => {
                                          setEditingTask(task);
                                          setIsTaskModalOpen(true);
                                        }}
                                        className="rounded-lg p-1.5 text-white/20 transition-colors hover:bg-fuchsia-400/10 hover:text-fuchsia-400"
                                      >
                                        <Edit3 size={13} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteTask(task._id)
                                        }
                                        className="rounded-lg p-1.5 text-white/20 transition-colors hover:bg-red-400/10 hover:text-red-400"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </article>
                                );
                              })
                            ) : (
                              <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-white/[0.05]">
                                <p className="font-mono-dm text-[10px] uppercase tracking-wider text-white/15">
                                  {column.emptyLabel}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Empty state */}
                  {tasks.length === 0 && (
                    <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.06] py-16 text-center">
                      <p className="font-mono-dm text-xs uppercase tracking-widest text-white/20 mb-4">
                        Nenhuma tarefa neste projeto ainda
                      </p>
                      <button
                        onClick={() => {
                          setEditingTask(null);
                          setIsTaskModalOpen(true);
                        }}
                        className="btn-fuchsia inline-flex items-center gap-2 rounded-xl bg-[#4a044e] px-4 py-2.5 text-sm font-bold text-white"
                      >
                        <Plus size={14} /> Adicionar primeira tarefa
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* ════════════════════════════
                  VIEW: TEAM
              ════════════════════════════ */}
              {currentView === "team" && (
                <>
                  <div className="mb-10">
                    <div className="font-mono-dm mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-fuchsia-400/50">
                      <span className="h-px w-4 bg-fuchsia-400/30" />
                      colaboração
                    </div>
                    <h1 className={sectionTitle}>Membros da Equipe</h1>
                    <p className={sectionSubtitle}>
                      Gerencie quem tem acesso aos seus projetos.
                    </p>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#131316]">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-white/[0.05]">
                          {["Membro", "Função", "Status", ""].map((h) => (
                            <th
                              key={h}
                              className="font-mono-dm px-6 py-4 text-[10px] uppercase tracking-[0.15em] text-white/20"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        <tr className="transition-colors hover:bg-white/[0.02]">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4a044e] text-sm font-bold text-white">
                                {user.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-white/80">
                                  {user.fullName}
                                </div>
                                <div className="font-mono-dm text-[10px] text-white/25">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="font-mono-dm text-[11px] text-white/30">
                              Proprietário
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="font-mono-dm inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-2.5 py-1 text-[10px] uppercase tracking-wider text-emerald-400">
                              <span className="h-1 w-1 rounded-full bg-emerald-400" />
                              Ativo
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button
                              onClick={() => setIsSettingsOpen(true)}
                              className="rounded-lg p-2 text-white/15 transition-colors hover:bg-white/[0.04] hover:text-white/40"
                            >
                              <Settings size={15} />
                            </button>
                          </td>
                        </tr>

                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center">
                            <p className="font-mono-dm mb-5 text-xs text-white/20">
                              Deseja colaborar com outros usuários?
                            </p>
                            <button className="btn-fuchsia inline-flex items-center gap-2 rounded-xl bg-[#4a044e] px-5 py-2.5 text-sm font-bold text-white">
                              <Plus size={14} /> Convidar membro
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSuccess={() => fetchTasks(activeProjectId!)}
        projectId={activeProjectId}
        taskToEdit={editingTask}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onSuccess={fetchUserData}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    </>
  );
}
