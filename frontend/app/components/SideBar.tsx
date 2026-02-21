import { LayoutDashboard, Settings, Image as ImageIcon, LogOut } from "lucide-react";

const SideBar = ({
  user,
}: {
  user: { fullName: string; profilePic: string; email: string };
}) => {
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        // Após o backend limpar o cookie/token, mandamos o usuário de volta para o login
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    }
  };
  return (
    <aside className="flex flex-col shrink-0 w-64 h-screen p-4 bg-white border-r border-gray-200">
      {/* --- NOVO: Perfil do Usuário Dinâmico --- */}
      <div className="flex items-center gap-3 p-3 mb-8 border border-gray-200 rounded-xl bg-gray-50">
        {/* Avatar */}
        {user.profilePic ? (
          <img
            src={user.profilePic}
            alt={`Foto de ${user.fullName}`}
            className="object-cover w-10 h-10 rounded-full"
          />
        ) : (
          <div className="flex items-center justify-center w-10 h-10 font-bold rounded-full bg-fuchsia-100 text-fuchsia-700">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Nome e Email */}
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-medium text-gray-800 truncate">
            {user.fullName}
          </span>
          <span className="text-xs text-gray-500 truncate">{user.email}</span>
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-3 p-2 mt-2 text-left text-red-500 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </div>
      {/* ---------------------------------------- */}

      {/* Navegação */}
      <nav className="flex flex-col flex-1 gap-2">
        <button className="flex items-center gap-3 p-2 text-left text-gray-700 rounded-lg hover:bg-gray-100">
          <LayoutDashboard size={18} className="text-fuchsia-600" />
          <span className="text-sm font-medium">page 1</span>
        </button>
        <button className="flex items-center gap-3 p-2 text-left text-gray-700 rounded-lg hover:bg-gray-100">
          <LayoutDashboard size={18} className="text-fuchsia-600 opacity-50" />
          <span className="text-sm font-medium">page 2</span>
        </button>
      </nav>

      {/* Configurações */}
      <div className="pt-4 mt-auto">
        <button className="flex items-center w-full gap-3 p-2 text-left text-gray-700 rounded-lg hover:bg-gray-100">
          <Settings size={18} className="text-fuchsia-600" />
          <span className="text-sm font-medium">settings</span>
        </button>
      </div>
    </aside>
  );
};

export default SideBar;
