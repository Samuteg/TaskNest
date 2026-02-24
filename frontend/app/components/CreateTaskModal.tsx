import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

// --- COMPONENTE DO MODAL ---
const CreateTaskModal = ({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void; }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Faz o POST para o seu backend criar a tarefa
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, status }),
        credentials: 'include',
      });

      if (response.ok) {
        setTitle('');
        setDescription('');
        setStatus('todo');
        onSuccess(); // Recarrega as tarefas na tela principal
        onClose();   // Fecha o modal
      } else {
        const data = await response.json();
        setError(data.message || 'Erro ao criar tarefa.');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-extrabold text-gray-900">Nova Tarefa</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <p className="text-sm font-bold text-red-700 bg-red-50 p-3 rounded border border-red-200">{error}</p>}

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Título da Tarefa *</label>
            <input
              type="text"
              required
              placeholder="Ex: Estudar React"
              className="w-full p-3 border border-gray-400 rounded-lg text-gray-900 focus:ring-2 focus:ring-fuchsia-600 focus:border-fuchsia-600 font-medium"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Descrição (Opcional)</label>
            <textarea
              rows={3}
              placeholder="Detalhes adicionais..."
              className="w-full p-3 border border-gray-400 rounded-lg text-gray-900 focus:ring-2 focus:ring-fuchsia-600 focus:border-fuchsia-600 font-medium resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-fuchsia-700 hover:bg-fuchsia-800 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? <><Loader2 size={18} className="animate-spin" /> Salvando...</> : 'Salvar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal