import {Image as ImageIcon, CheckCircle2, Clock, ListTodo } from 'lucide-react';

const TaskCard = ({ task }: { task: any }) => {
  // Ícone muda baseada no status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle2 size={18} className="text-green-500" />;
      case 'in-progress': return <Clock size={18} className="text-blue-500" />;
      default: return <ListTodo size={18} className="text-gray-400" />;
    }
  };

  return (
    <div className="flex items-center gap-6 p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-center w-16 h-16 bg-gray-50 border border-gray-100 rounded-lg text-gray-400 relative">
        <ImageIcon size={24} />
        <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-gray-100">
          {getStatusIcon(task.status)}
        </div>
      </div>
      
      <div className="flex flex-col flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800">{task.title}</h3>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2">{task.description || "Sem descrição"}</p>
        
        {/* Mostra a data de criação formatada */}
        <span className="text-[10px] text-gray-300 mt-2 uppercase font-bold tracking-wider">
          Criado em: {new Date(task.createdAt).toLocaleDateString('pt-BR')}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;