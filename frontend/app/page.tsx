"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./components/Sidebar";
import TaskModal from "./components/TaskModal";
import SettingsModal from "./components/SettingsModal";
import {
  Image as ImageIcon,
  Trash2,
  Edit3,
  Loader2,
  Plus,
  ArrowLeft,
  Settings,
} from "lucide-react";

export default function HomePage() {
  const cardColors = [
    "bg-fuchsia-600",
    "bg-pink-500",
    "bg-purple-500",
    "bg-rose-500",
    "bg-violet-500",
  ];

  const formatDate = (dateString: string) => {
    if (!dateString) return "25/01/2026";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-PT");
  };
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // CONTROLO DO MODO ESCURO
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
  const html = document.documentElement; // Isto seleciona a tag <html>
  
  if (darkMode) {
    html.classList.add('dark');
    console.log("Modo Escuro Ativado!");
  } else {
    html.classList.remove('dark');
    console.log("Modo Claro Ativado!");
  }
}, [darkMode]);

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentView, setCurrentView] = useState<"projects" | "tasks" | "team">(
    "projects",
  );
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  const activeProject: any = projects.find(
    (p: any) => p._id === activeProjectId,
  );

  const fetchUserData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/check", {
        credentials: "include",
      });
      if (res.ok) setUser(await res.json());
      else router.push("/login");
    } catch (err) {
      router.push("/login");
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/projects", {
        credentials: "include",
      });
      if (res.ok) setProjects(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async (projId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${projId}`, {
        credentials: "include",
      });
      if (res.ok) setTasks(await res.json());
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
      await fetch("http://localhost:5000/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
        credentials: "include",
      });
      fetchProjects();
    } catch (err) {}
  };

  const handleDeleteProject = async (
    projectId: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (!window.confirm("Excluir projeto e todas as tarefas?")) return;
    try {
      await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (activeProjectId === projectId) setCurrentView("projects");
      fetchProjects();
    } catch (err) {}
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Apagar esta tarefa?")) return;
    try {
      await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (activeProjectId) fetchTasks(activeProjectId);
    } catch (err) {}
  };

  const handleLogout = async () => {
    await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/login");
  };

  const openProject = (projectId: string) => {
    setActiveProjectId(projectId);
    setCurrentView("tasks");
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc] dark:bg-zinc-950 text-fuchsia-700">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-zinc-950 font-sans transition-colors duration-200">
      <Sidebar
        user={user}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto">
          {currentView === "projects" && (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900 dark:text-zinc-50 mb-1">
                    Meus Projetos
                  </h1>
                  <p className="text-gray-500 dark:text-zinc-400 font-medium text-sm">
                    Bem-vindo, {user.fullName}! Faz a gestão dos teus projetos
                    aqui.
                  </p>
                </div>
                <button
                  onClick={handleCreateProject}
                  className="flex items-center gap-2 bg-fuchsia-700 hover:bg-fuchsia-800 active:scale-95 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md"
                >
                  <Plus size={18} /> Novo Projeto
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map((proj: any, index: number) => {
                  const colorClass = cardColors[index % cardColors.length];
                  return (
                    <div
                      key={proj._id}
                      onClick={() => openProject(proj._id)}
                      className="group relative bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border-2 border-transparent dark:border-zinc-800 hover:border-fuchsia-200 dark:hover:border-fuchsia-800 overflow-hidden cursor-pointer hover:shadow-lg transition-all flex flex-col min-h-[180px]"
                    >
                      <div
                        className={`h-2 w-full absolute top-0 left-0 ${colorClass}`}
                      />
                      <div className="p-6 flex-1 flex flex-col border border-t-0 border-gray-100 dark:border-zinc-800 rounded-b-2xl">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-sm ${colorClass}`}
                            >
                              {proj.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-extrabold text-gray-900 dark:text-zinc-100 truncate max-w-[180px]">
                                {proj.name}
                              </h3>
                              <p className="text-xs font-bold text-gray-400 dark:text-zinc-500">
                                {formatDate(proj.createdAt)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleDeleteProject(proj._id, e)}
                            className="p-2 text-gray-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 line-clamp-2 mt-2">
                          Clica aqui para gerires as tarefas deste projeto.
                        </p>
                        <div className="mt-auto pt-4 flex items-center justify-between text-xs font-bold text-gray-400 dark:text-zinc-500">
                          <span>Acesso Rápido</span>
                          <span className="flex items-center text-fuchsia-600 dark:text-fuchsia-400 group-hover:translate-x-1 transition-transform">
                            Abrir &rarr;
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {currentView === "tasks" && activeProjectId && (
            <>
              <button
                onClick={() => setCurrentView("projects")}
                className="flex items-center gap-2 text-gray-500 dark:text-zinc-400 hover:text-fuchsia-700 dark:hover:text-fuchsia-400 mb-6 font-bold transition-colors"
              >
                <ArrowLeft size={18} /> Voltar aos projetos
              </button>

              <div className="flex justify-between items-end border-b-2 border-gray-100 dark:border-zinc-800 pb-5 mb-6">
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900 dark:text-zinc-50 mb-1">
                    {activeProject?.name}
                  </h1>
                  <p className="text-gray-500 dark:text-zinc-400 font-medium text-sm">
                    Gere as tarefas deste projeto específico.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setIsTaskModalOpen(true);
                  }}
                  className="bg-fuchsia-700 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-fuchsia-800 active:scale-95 transition-all shadow-md"
                >
                  + Nova Tarefa
                </button>
              </div>

              {tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map((task: any) => (
                    <div
                      key={task._id}
                      className="flex items-center justify-between p-5 bg-white dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 rounded-2xl shadow-sm hover:border-fuchsia-300 dark:hover:border-fuchsia-700 transition-all group"
                    >
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div
                          className={`w-3 h-12 rounded-full shrink-0 ${task.status === "done" ? "bg-green-500 dark:bg-green-600" : task.status === "in-progress" ? "bg-blue-500 dark:bg-blue-600" : "bg-yellow-400 dark:bg-yellow-500"}`}
                        />
                        <div className="flex flex-col overflow-hidden">
                          <h3
                            className={`font-extrabold text-gray-900 dark:text-zinc-100 truncate text-lg ${task.status === "done" ? "line-through text-gray-400 dark:text-zinc-600" : ""}`}
                          >
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 truncate mt-0.5">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingTask(task);
                            setIsTaskModalOpen(true);
                          }}
                          className="p-2.5 text-gray-400 dark:text-zinc-500 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20 rounded-xl transition-colors"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="p-2.5 text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white dark:bg-zinc-900 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl">
                  <p className="text-gray-500 dark:text-zinc-400 font-bold mb-3">
                    Nenhuma tarefa neste projeto ainda.
                  </p>
                  <button
                    onClick={() => {
                      setEditingTask(null);
                      setIsTaskModalOpen(true);
                    }}
                    className="text-fuchsia-700 dark:text-fuchsia-400 font-extrabold hover:underline"
                  >
                    Adiciona a tua primeira tarefa
                  </button>
                </div>
              )}
            </>
          )}

          {currentView === "team" && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-zinc-50 mb-1">
                  Membros da Equipa
                </h1>
                <p className="text-gray-500 dark:text-zinc-400 font-medium text-sm">
                  Gere quem tem acesso aos teus projetos.
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b-2 border-gray-100 dark:border-zinc-800">
                    <tr>
                      <th className="px-6 py-4 text-xs font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                        Membro
                      </th>
                      <th className="px-6 py-4 text-xs font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                        Função
                      </th>
                      <th className="px-6 py-4 text-xs font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-gray-50 dark:divide-zinc-800">
                    <tr className="hover:bg-fuchsia-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-400 flex items-center justify-center font-extrabold">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-extrabold text-gray-900 dark:text-zinc-100">
                              {user.fullName} (Tu)
                            </div>
                            <div className="text-xs font-bold text-gray-500 dark:text-zinc-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-600 dark:text-zinc-400 font-bold">
                        Proprietário
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 text-[11px] font-extrabold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/20 rounded-full uppercase">
                          Ativo
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="p-2 text-gray-400 dark:text-zinc-500 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20 rounded-lg transition-colors">
                          <Settings size={18} />
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center">
                        <p className="text-gray-400 dark:text-zinc-500 font-bold text-sm mb-4">
                          Desejas colaborar com outros utilizadores?
                        </p>
                        <button className="inline-flex items-center gap-2 bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-700 dark:text-fuchsia-400 px-5 py-2.5 rounded-xl font-extrabold text-sm hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/40 transition-colors">
                          <Plus size={16} /> Convidar Membro
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
    </div>
  );
}
