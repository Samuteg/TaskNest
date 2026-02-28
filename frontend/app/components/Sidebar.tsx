import { LayoutDashboard, Users, Settings, LogOut } from "lucide-react";

const Sidebar = ({ user, onLogout, onOpenSettings, currentView, setCurrentView }: any) => {
  return (
    <aside className="flex flex-col shrink-0 w-64 h-screen bg-white border-r border-gray-200">
      <div className="p-6">
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">TaskNest</h2>
      </div>

      <div className="px-4 mb-2">
        <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3 px-2">Navegação</h3>
        <nav className="flex flex-col gap-1">
          <button 
            onClick={() => setCurrentView('projects')}
            className={`flex items-center gap-3 w-full p-2.5 rounded-lg font-bold transition-colors ${currentView === 'projects' || currentView === 'tasks' ? 'bg-fuchsia-50 text-fuchsia-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <LayoutDashboard size={18} />
            <span className="text-sm">Projetos</span>
          </button>
          
          <button 
            onClick={() => setCurrentView('team')}
            className={`flex items-center gap-3 w-full p-2.5 rounded-lg font-bold transition-colors ${currentView === 'team' ? 'bg-fuchsia-50 text-fuchsia-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <Users size={18} />
            <span className="text-sm">Equipa</span>
          </button>

          <button 
            onClick={onOpenSettings}
            className="flex items-center gap-3 w-full p-2.5 rounded-lg font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Settings size={18} />
            <span className="text-sm">Configurações</span>
          </button>
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-gray-200">
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 font-bold rounded-full bg-fuchsia-100 text-fuchsia-700 shrink-0">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-gray-800 truncate">{user?.fullName}</span>
              <span className="text-xs font-medium text-gray-500 truncate">{user?.email}</span>
            </div>
          </div>
          <button 
            onClick={onLogout} 
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
