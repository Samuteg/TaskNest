"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SideBar from "../components/SideBar";
import TaskCard from "../components/TaskCard"
import CreateTaskModal from "../components/CreateTaskModal"

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // NOVO: Estado para controlar o modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // NOVO: Função isolada para buscar as tarefas (assim podemos chamar ela de novo após salvar uma nova)
  const fetchTasks = async () => {
    try {
      const tasksRes = await fetch('http://localhost:5000/api/tasks', { credentials: 'include' });
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
      }
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
    }
  };

  useEffect(() => {
    const initDashboard = async () => {
      try {
        const authRes = await fetch('http://localhost:5000/api/auth/check', { credentials: 'include' });
        if (!authRes.ok) return router.push('/login');
        
        const userData = await authRes.json();
        setUser(userData);

        // Chama a função de buscar tarefas
        await fetchTasks();

      } catch (error) {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    initDashboard();
  }, [router]);

  if (isLoading) return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideBar user={user} />

      <main className="flex-1 p-10">
        <div className="max-w-6xl mx-auto">
          <header className="mb-10 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Minhas Tarefas</h1>
              <p className="text-gray-700 font-medium">Gerencie seus projetos e prazos</p>
            </div>
            
            {/* NOVO: Botão que abre o Modal */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-fuchsia-700 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-fuchsia-800 transition-colors shadow-sm"
            >
              + Nova Tarefa
            </button>
          </header>

          {tasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tasks.map((task: any) => (
                <TaskCard key={task._id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-2xl bg-white">
              <p className="text-gray-500 font-medium mb-4">Nenhuma tarefa encontrada.</p>
              {/* Botão extra no estado vazio para facilitar */}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-fuchsia-700 font-bold hover:underline"
              >
                Comece criando uma!
              </button>
            </div>
          )}
        </div>
      </main>

      {/* NOVO: Renderização do Modal */}
      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchTasks} // Se o modal salvar com sucesso, ele chama fetchTasks de novo!
      />
    </div>
  )
}