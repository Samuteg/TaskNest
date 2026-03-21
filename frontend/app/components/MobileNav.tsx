"use client";

import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  FolderKanban,
  X,
  Menu,
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

interface MobileNavProps {
  user: { fullName: string; email: string; profilePic?: string } | null;
  onLogout: () => void;
  onOpenSettings: () => void;
  currentView: string;
  setCurrentView: (view: "projects" | "tasks" | "team") => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const MobileNav = ({
  user,
  onLogout,
  onOpenSettings,
  currentView,
  setCurrentView,
  isSidebarOpen,
  setIsSidebarOpen,
}: MobileNavProps) => {
  const handleNav = (id: "projects" | "team") => {
    setCurrentView(id);
    setIsSidebarOpen(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-mono-dm { font-family: 'DM Mono', monospace; }

        .mobile-drawer {
          transform: translateX(-100%);
          transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .mobile-drawer.open {
          transform: translateX(0);
        }

        .mobile-overlay {
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.28s ease;
        }
        .mobile-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }

        .bottom-nav-btn { transition: color 0.15s; }
        .bottom-nav-btn.active { color: #e879f9; }
      `}</style>

      {/* ── TOP BAR (mobile-only) ── */}
      <header className="font-syne fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-white/[0.06] bg-[#0d0d0f]/95 px-4 py-3 backdrop-blur-sm md:hidden">
        <button
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Abrir menu"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/60 transition-colors active:bg-white/[0.08]"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#4a044e]">
            <FolderKanban size={12} className="text-white" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-white">
            Task<span className="text-fuchsia-400">Nest</span>
          </span>
        </div>

        {/* Avatar do usuário */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#4a044e] text-xs font-bold text-white">
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
      </header>

      {/* ── OVERLAY ── */}
      <div
        onClick={() => setIsSidebarOpen(false)}
        className={`mobile-overlay fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden ${isSidebarOpen ? "open" : ""}`}
      />

      {/* ── DRAWER SIDEBAR ── */}
      <aside
        className={`mobile-drawer font-syne fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/[0.07] bg-[#0d0d0f] md:hidden ${isSidebarOpen ? "open" : ""}`}
      >
        {/* Header do drawer */}
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4a044e]">
              <FolderKanban size={13} className="text-white" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-white">
              Task<span className="text-fuchsia-400">Nest</span>
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Fechar menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition-colors hover:bg-white/[0.05] hover:text-white/60"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 px-3">
          <p className="font-mono-dm mb-2 px-2 text-[9px] uppercase tracking-[0.2em] text-white/20">
            Navegação
          </p>
          <nav className="flex flex-col gap-0.5">
            {navItems.map(({ id, label, icon: Icon, views }) => {
              const isActive = views.includes(currentView);
              return (
                <button
                  key={id}
                  onClick={() => handleNav(id as "projects" | "team")}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#4a044e] text-white"
                      : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
                  }`}
                >
                  <Icon size={17} />
                  {label}
                </button>
              );
            })}

            <button
              onClick={() => {
                onOpenSettings();
                setIsSidebarOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white/70"
            >
              <Settings size={17} />
              Configurações
            </button>
          </nav>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-white/[0.05]" />

        {/* User card */}
        <div className="p-4">
          <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#4a044e] text-sm font-bold text-white">
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
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white/70">
                  {user?.fullName}
                </p>
                <p className="font-mono-dm truncate text-[10px] text-white/25">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onLogout();
                setIsSidebarOpen(false);
              }}
              title="Sair"
              className="shrink-0 rounded-lg p-2 text-white/20 transition-colors hover:bg-red-400/10 hover:text-red-400"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── BOTTOM NAV (mobile-only) ── */}
      <nav className="font-syne fixed bottom-0 inset-x-0 z-30 flex items-center justify-around border-t border-white/[0.06] bg-[#0d0d0f]/95 pb-safe px-2 pt-2 backdrop-blur-sm md:hidden"
        style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
      >
        {navItems.map(({ id, label, icon: Icon, views }) => {
          const isActive = views.includes(currentView);
          return (
            <button
              key={id}
              onClick={() => handleNav(id as "projects" | "team")}
              className={`bottom-nav-btn flex flex-1 flex-col items-center gap-1 py-1.5 text-white/30 ${isActive ? "active" : ""}`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="font-mono-dm text-[9px] uppercase tracking-[0.1em]">
                {label}
              </span>
            </button>
          );
        })}
        <button
          onClick={onOpenSettings}
          className="bottom-nav-btn flex flex-1 flex-col items-center gap-1 py-1.5 text-white/30"
        >
          <Settings size={20} strokeWidth={1.8} />
          <span className="font-mono-dm text-[9px] uppercase tracking-[0.1em]">
            Config.
          </span>
        </button>
      </nav>
    </>
  );
};

export default MobileNav;
