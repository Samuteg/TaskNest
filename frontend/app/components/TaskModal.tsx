import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

// --- COMPONENTE DO MODAL ---
const TaskModal = ({ isOpen, onClose, onSuccess, projectId, taskToEdit }: any) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status || 'todo');
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
    }
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      setError("Erro: Projeto não identificado.");
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const url = taskToEdit ? `http://localhost:5000/api/tasks/${taskToEdit._id}` : `http://localhost:5000/api/tasks`;
      const response = await fetch(url, {
        method: taskToEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, status, project: projectId }), 
        credentials: 'include',
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        setError(data.message || 'Erro ao guardar tarefa.');
      }
    } catch (err) {
      setError('Erro de ligação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-extrabold text-gray-900">{taskToEdit ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-sm font-bold text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Título *</label>
            <input type="text" required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-600 outline-none font-medium text-gray-900" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Descrição</label>
            <textarea rows={3} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-600 outline-none resize-none font-medium text-gray-900" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Estado</label>
            <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-600 outline-none font-medium bg-white text-gray-900" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="todo">Pendente</option>
              <option value="in-progress">Em Progresso</option>
              <option value="done">Concluída</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
            <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-fuchsia-700 hover:bg-fuchsia-800 active:scale-95 rounded-lg disabled:opacity-50 transition-all">
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal