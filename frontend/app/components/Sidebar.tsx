import { LayoutDashboard, Users, Settings, LogOut } from "lucide-react";

const Sidebar = ({ user, onLogout, onOpenSettings, currentView, setCurrentView }: any) => {
  return (
    <aside className="flex flex-col shrink-0 w-64 h-screen bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 transition-colors duration-200">
      <div className="p-6">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-zinc-100 tracking-tight">TaskNest</h2>
      </div>

      <div className="px-4 mb-2">
        <h3 className="text-xs font-bold tracking-wider text-gray-400 dark:text-zinc-500 uppercase mb-3 px-2">Navegação</h3>
        <nav className="flex flex-col gap-1">
          <button 
            onClick={() => setCurrentView('projects')}
            className={`flex items-center gap-3 w-full p-2.5 rounded-lg font-bold transition-all ${currentView === 'projects' || currentView === 'tasks' ? 'bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-700 dark:text-fuchsia-400' : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-zinc-100'}`}
          >
            <LayoutDashboard size={18} />
            <span className="text-sm">Projetos</span>
          </button>
          
          <button 
            onClick={() => setCurrentView('team')}
            className={`flex items-center gap-3 w-full p-2.5 rounded-lg font-bold transition-all ${currentView === 'team' ? 'bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-700 dark:text-fuchsia-400' : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-zinc-100'}`}
          >
            <Users size={18} />
            <span className="text-sm">Equipe</span>
          </button>

          <button 
            onClick={onOpenSettings}
            className="flex items-center gap-3 w-full p-2.5 rounded-lg font-bold text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-zinc-100 transition-all"
          >
            <Settings size={18} />
            <span className="text-sm">Configurações</span>
          </button>
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-gray-200 dark:border-zinc-800">
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 font-bold rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-400 shrink-0">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-gray-800 dark:text-zinc-200 truncate">{user?.fullName}</span>
              <span className="text-xs font-medium text-gray-500 dark:text-zinc-500 truncate">{user?.email}</span>
            </div>
          </div>
          <button 
            onClick={onLogout} 
            className="p-2 text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
