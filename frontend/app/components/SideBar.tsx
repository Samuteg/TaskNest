import { Trash2, Edit3, FolderPlus, Folder, LogOut } from "lucide-react";

const Sidebar = ({
  user,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onEditProject,
  onDeleteProject,
  onLogout,
}: any) => {
  return (
    <aside className="flex flex-col shrink-0 w-64 h-screen p-4 bg-white border-r border-gray-200">
      <div className="flex items-center gap-3 p-3 mb-8 border border-gray-200 rounded-xl bg-gray-50">
        {user?.profilePic ? (
          <img
            src={user.profilePic}
            alt="Perfil"
            className="object-cover w-10 h-10 rounded-full"
          />
        ) : (
          <div className="flex items-center justify-center w-10 h-10 font-bold rounded-full bg-fuchsia-100 text-fuchsia-700">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-medium text-gray-800 truncate">
            {user?.fullName}
          </span>
          <span className="text-xs text-gray-500 truncate">{user?.email}</span>
        </div>
      </div>

      {/* Título Projetos + Botão Novo Projeto */}
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase">
          Projetos
        </h3>
        <button
          onClick={onCreateProject}
          className="text-gray-400 hover:text-fuchsia-600 transition-colors"
        >
          <FolderPlus size={16} />
        </button>
      </div>

      <nav className="flex flex-col flex-1 gap-2 overflow-y-auto">
        {projects.map((proj: any) => (
          <div
            key={proj._id}
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer group transition-colors ${activeProjectId === proj._id ? "bg-fuchsia-50 text-fuchsia-700" : "text-gray-700 hover:bg-gray-100"}`}
          >
            <div
              className="flex items-center gap-3 w-full"
              onClick={() => onSelectProject(proj._id)}
            >
              <Folder
                size={18}
                className={
                  activeProjectId === proj._id
                    ? "text-fuchsia-600"
                    : "text-gray-400"
                }
              />
              <span className="text-sm font-medium truncate">{proj.name}</span>
            </div>
            {/* Ações do Projeto (Aparecem ao passar o rato) */}
            <div className="hidden group-hover:flex items-center gap-1">
              <button
                onClick={() => onEditProject(proj)}
                className="p-1 text-gray-400 hover:text-blue-600"
              >
                <Edit3 size={14} />
              </button>
              <button
                onClick={() => onDeleteProject(proj._id)}
                className="p-1 text-gray-400 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </nav>

      <div className="pt-4 mt-auto border-t border-gray-100">
        <button
          onClick={onLogout}
          className="flex items-center w-full gap-3 p-2 text-left text-red-500 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
