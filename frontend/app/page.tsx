"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from "./components/SideBar";
import { 
  Image as ImageIcon, 
  Trash2, 
  Edit3, 
  Folder, 
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para Projetos e Tarefas
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Estados dos Modais de Tarefas
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null); // Se for null = Criar nova, se tiver dados = Editar

  const activeProject = projects.find((p: any) => p._id === activeProjectId);

  // --- REQUISIÇÕES AO BACKEND ---
  const fetchProjectsAndTasks = async () => {
    try {
      const projRes = await fetch("http://localhost:5000/api/projects", { credentials: "include" });
      if (projRes.ok) {
        const projData = await projRes.json();
        setProjects(projData);
        // Seleciona automaticamente o primeiro projeto se não houver nenhum selecionado
        if (projData.length > 0 && !activeProjectId) {
          setActiveProjectId(projData[0]._id);
        }
      }

      // Se houver um projeto selecionado, busca as tarefas dele
      if (activeProjectId) {
        const taskRes = await fetch(`http://localhost:5000/api/tasks/${activeProjectId}`, { credentials: "include" });
        if (taskRes.ok) {
          const taskData = await taskRes.json();
          setTasks(taskData);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/check", { credentials: "include" });
        if (res.ok) {
          setUser(await res.json());
        } else {
          router.push("/login");
        }
      } catch (err) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  // Executa toda vez que o ID do projeto ativo mudar
  useEffect(() => {
    if (!loading) fetchProjectsAndTasks();
  }, [loading, activeProjectId]);

  // --- CRUD PROJETOS ---
  const handleCreateProject = async () => {
    const name = window.prompt("Nome do novo projeto:");
    if (!name) return;
    try {
      await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
        credentials: 'include'
      });
      fetchProjectsAndTasks();
    } catch (err) { console.error(err); }
  };

  const handleEditProject = async (proj: any) => {
    const newName = window.prompt("Editar nome do projeto:", proj.name);
    if (!newName || newName === proj.name) return;
    try {
      await fetch(`http://localhost:5000/api/projects/${proj._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
        credentials: 'include'
      });
      fetchProjectsAndTasks();
    } catch (err) { console.error(err); }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm("Excluir projeto e todas as suas tarefas? Esta ação não pode ser desfeita.")) return;
    try {
      await fetch(`http://localhost:5000/api/projects/${projectId}`, { method: 'DELETE', credentials: 'include' });
      setActiveProjectId(null); // Reseta o projeto ativo
      fetchProjectsAndTasks();
    } catch (err) { console.error(err); }
  };

  // --- CRUD TAREFAS (Deletar e Editar) ---
  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Tem certeza que deseja apagar esta tarefa?")) return;
    try {
      await fetch(`http://localhost:5000/api/tasks/${taskId}`, { method: 'DELETE', credentials: 'include' });
      fetchProjectsAndTasks(); // Recarrega as tarefas
    } catch (err) { console.error(err); }
  };

  const handleLogout = async () => {
    await fetch('http://localhost:5000/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/login');
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-bold">Carregando...</div>;
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        user={user} 
        projects={projects} 
        activeProjectId={activeProjectId}
        onSelectProject={setActiveProjectId}
        onCreateProject={handleCreateProject}
        onEditProject={handleEditProject}
        onDeleteProject={handleDeleteProject}
        onLogout={handleLogout}
      />

      <main className="flex-1 p-10 relative">
        <div className="max-w-6xl mx-auto">
          {activeProjectId ? (
            <>
              <header className="mb-10 flex justify-between items-end border-b border-gray-200 pb-6">
                <div>
                  <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{activeProject?.name || "Projeto"}</h1>
                  <p className="text-lg text-gray-700 font-medium">Gerencie suas tarefas deste projeto</p>
                </div>
                <button 
                  onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
                  className="bg-fuchsia-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-fuchsia-800 transition-all shadow-md"
                >
                  + Nova Tarefa
                </button>
              </header>

              {tasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {tasks.map((task: any) => (
                    <div key={task._id} className="flex items-center gap-6 p-6 bg-white border-2 border-gray-200 rounded-2xl shadow-sm hover:border-fuchsia-300 transition-all group">
                      <div className="flex items-center justify-center w-16 h-16 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-400">
                        <ImageIcon size={24} />
                      </div>
                      <div className="flex flex-col flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{task.title}</h3>
                        <p className="text-sm text-gray-600 font-medium">{task.description}</p>
                      </div>
                      {/* Botões de Ação na Tarefa */}
                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingTask(task); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg hover:bg-blue-50">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDeleteTask(task._id)} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 rounded-lg hover:bg-red-50">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 border-4 border-dashed border-gray-200 rounded-3xl bg-white">
                  <p className="text-xl text-gray-500 font-bold mb-4">Nenhuma tarefa neste projeto</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full pt-32">
              <Folder size={64} className="text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-500 mb-2">Nenhum projeto selecionado</h2>
              <p className="text-gray-400">Crie um projeto no menu lateral para começar.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}