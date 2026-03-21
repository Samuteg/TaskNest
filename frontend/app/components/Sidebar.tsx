import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  FolderKanban,
} from "lucide-react";

const navItems = [
  {
    id: "projects",
    label: "Projetos",
    icon: LayoutDashboard,
    views: ["projects", "tasks"],
  },
  { id: "team", label: "Equipe", icon: Users, views: ["team"] },
];

const Sidebar = ({
  user,
  onLogout,
  onOpenSettings,
  currentView,
  setCurrentView,
}: any) => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-mono-dm { font-family: 'DM Mono', monospace; }
        .sidebar-btn { transition: background 0.15s, color 0.15s; }
      `}</style>

      <aside className="font-syne hidden h-screen w-56 shrink-0 flex-col border-r border-white/[0.05] bg-[#0d0d0f] md:flex">
        {/* ── LOGO ── */}
        <div className="flex items-center gap-2.5 px-5 py-6">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4a044e]">
            <FolderKanban size={13} className="text-white" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-white">
            Task<span className="text-fuchsia-400">Nest</span>
          </span>
        </div>

        {/* ── NAV ── */}
        <div className="px-3">
          <p className="font-mono-dm mb-2 px-2 text-[9px] uppercase tracking-[0.2em] text-white/20">
            Navegação
          </p>
          <nav className="flex flex-col gap-0.5">
            {navItems.map(({ id, label, icon: Icon, views }) => {
              const isActive = views.includes(currentView);
              return (
                <button
                  key={id}
                  onClick={() => setCurrentView(id)}
                  className={`sidebar-btn flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium ${
                    isActive
                      ? "bg-[#4a044e] text-white"
                      : "text-white/30 hover:bg-white/[0.04] hover:text-white/60"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              );
            })}

            {/* Settings (no active state — opens modal) */}
            <button
              onClick={onOpenSettings}
              className="sidebar-btn flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-white/30 hover:bg-white/[0.04] hover:text-white/60"
            >
              <Settings size={15} />
              Configurações
            </button>
          </nav>
        </div>

        {/* ── DIVIDER ── */}
        <div className="mx-5 mt-6 h-px bg-white/[0.05]" />

        {/* ── USER CARD ── */}
        <div className="mt-auto p-3">
          <div className="group flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 transition-colors hover:border-white/[0.08]">
            <div className="flex min-w-0 items-center gap-2.5">
              {/* Avatar */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#4a044e] text-xs font-bold text-white">
                {user?.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="Foto de perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user?.fullName?.charAt(0).toUpperCase() || "U"
                )}
              </div>

              {/* Info */}
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white/60">
                  {user?.fullName}
                </p>
                <p className="font-mono-dm truncate text-[9px] text-white/20">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              title="Sair"
              className="shrink-0 rounded-lg p-1.5 text-white/15 transition-colors hover:bg-red-400/10 hover:text-red-400"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
