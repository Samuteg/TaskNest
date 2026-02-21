"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SideBar from "../components/SideBar";
import TaskCard from "../components/TaskCard"

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]); // Estado para as tarefas reais
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initDashboard = async () => {
      try {
        // 1. Verifica Autenticação
        const authRes = await fetch('http://localhost:5000/api/auth/check', { credentials: 'include' });
        if (!authRes.ok) return router.push('/login');
        
        const userData = await authRes.json();
        setUser(userData);

        // 2. Busca as Tasks do usuário (Assumindo a rota GET /api/tasks)
        const tasksRes = await fetch('http://localhost:5000/api/tasks', { credentials: 'include' });
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData);
        }

      } catch (error) {
        console.error("Erro no carregamento:", error);
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
              <h1 className="text-3xl font-bold text-gray-900">Minhas Tarefas</h1>
              <p className="text-gray-500">Gerencie seus projetos e prazos</p>
            </div>
            {/* Botão de exemplo para adicionar task */}
            <button className="bg-fuchsia-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-fuchsia-700 transition-colors">
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
            <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
              <p className="text-gray-400">Nenhuma tarefa encontrada. Comece criando uma!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}