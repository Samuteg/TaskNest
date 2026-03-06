import React, { useEffect, useRef, useState } from "react";
import { X, Loader2, Users, Settings, LayoutDashboard } from "lucide-react";
import { apiUrl } from "../lib/api";

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: {
    fullName: string;
    email: string;
    profilePic?: string;
  } | null;
  onSuccess: () => void | Promise<void>;
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
};

const tabs = [
  { id: "profile", label: "Perfil", icon: Users },
  { id: "security", label: "Segurança", icon: Settings },
  { id: "prefs", label: "Preferências", icon: LayoutDashboard },
];

const SettingsModal = ({
  isOpen,
  onClose,
  user,
  onSuccess,
  darkMode,
  setDarkMode,
}: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [fullName, setFullName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(
    null,
  );
  const [localProfilePreview, setLocalProfilePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user && isOpen) {
      setFullName(user.fullName);
      setProfilePic(user.profilePic || "");
      setSelectedProfileFile(null);
      setLocalProfilePreview("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [user, isOpen]);

  useEffect(() => {
    return () => {
      if (localProfilePreview.startsWith("blob:"))
        URL.revokeObjectURL(localProfilePreview);
    };
  }, [localProfilePreview]);

  if (!isOpen || !user) return null;

  const clearLocalPreview = () => {
    if (localProfilePreview.startsWith("blob:"))
      URL.revokeObjectURL(localProfilePreview);
    setLocalProfilePreview("");
  };

  const extractMessage = async (
    response: Response,
    fallback: string,
  ): Promise<string> => {
    try {
      const d = await response.json();
      return d.message || fallback;
    } catch {
      return fallback;
    }
  };

  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    clearLocalPreview();
    setLocalProfilePreview(URL.createObjectURL(file));
    setSelectedProfileFile(file);
    setMessage({ text: "", type: "" });
  };

  const uploadProfileImage = async (): Promise<string> => {
    if (!selectedProfileFile) return profilePic;
    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append("profileImage", selectedProfileFile);
    try {
      const res = await fetch(apiUrl("/api/auth/profile/upload"), {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok)
        throw new Error(await extractMessage(res, "Erro ao enviar imagem."));
      const data = await res.json();
      return data.profilePic || "";
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });
    try {
      let nextPic = profilePic;
      if (selectedProfileFile) nextPic = await uploadProfileImage();
      const res = await fetch(apiUrl("/api/auth/profile"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, profilePic: nextPic }),
        credentials: "include",
      });
      if (res.ok) {
        setMessage({ text: "Perfil atualizado com sucesso!", type: "success" });
        setProfilePic(nextPic);
        setSelectedProfileFile(null);
        clearLocalPreview();
        if (fileInputRef.current) fileInputRef.current.value = "";
        onSuccess();
      } else {
        setMessage({
          text: await extractMessage(res, "Erro ao atualizar."),
          type: "error",
        });
      }
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Erro de conexão.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-medium text-white placeholder-white/20 outline-none transition-all focus:border-fuchsia-400/40 focus:ring-2 focus:ring-fuchsia-400/10";

  const inputDisabledClass =
    "w-full rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 text-sm font-medium text-white/20 cursor-not-allowed";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-mono-dm { font-family: 'DM Mono', monospace; }
        .settings-scroll::-webkit-scrollbar { width: 3px; }
        .settings-scroll::-webkit-scrollbar-track { background: transparent; }
        .settings-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 4px; }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      >
        {/* Click-outside to close */}
        <button
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal card */}
        <div className="font-syne relative z-10 flex h-[560px] w-full max-w-2xl overflow-hidden rounded-2xl border border-white/[0.07] bg-[#131316] shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
          {/* ── LEFT NAV ── */}
          <div className="flex w-44 shrink-0 flex-col border-r border-white/[0.06] bg-[#0d0d0f] p-4">
            {/* Logo mark */}
            <div className="mb-6 flex items-center gap-2 px-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#4a044e]">
                <Settings size={11} className="text-white" />
              </div>
              <span className="font-mono-dm text-[10px] uppercase tracking-[0.15em] text-white/25">
                Config.
              </span>
            </div>

            {/* Tabs */}
            <nav className="flex flex-col gap-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${
                    activeTab === id
                      ? "bg-[#4a044e] text-white"
                      : "text-white/30 hover:bg-white/[0.04] hover:text-white/60"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </nav>

            {/* User mini card at bottom */}
            <div className="mt-auto rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
              <div className="mb-1.5 flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#4a044e] text-xs font-bold text-white">
                  {localProfilePreview || profilePic ? (
                    <img
                      src={localProfilePreview || profilePic}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user.fullName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-white/60">
                    {user.fullName}
                  </p>
                </div>
              </div>
              <p className="font-mono-dm truncate text-[9px] text-white/20">
                {user.email}
              </p>
            </div>
          </div>

          {/* ── RIGHT CONTENT ── */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-7 py-5">
              <div>
                <div className="font-mono-dm mb-0.5 text-[9px] uppercase tracking-[0.2em] text-fuchsia-400/40">
                  configurações
                </div>
                <h2 className="text-base font-extrabold tracking-tight text-white">
                  {tabs.find((t) => t.id === activeTab)?.label}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-white/20 transition-colors hover:bg-white/[0.05] hover:text-white/50"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="settings-scroll flex-1 overflow-y-auto px-7 py-6">
              {/* Feedback */}
              {message.text && (
                <div
                  className={`mb-5 rounded-xl border p-3 text-sm font-medium ${
                    message.type === "success"
                      ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-400"
                      : "border-red-400/20 bg-red-400/5 text-red-400"
                  }`}
                >
                  {message.text}
                </div>
              )}

              {/* ── TAB: PROFILE ── */}
              {activeTab === "profile" && (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Avatar */}
                  <div>
                    <label className="font-mono-dm mb-3 block text-[10px] uppercase tracking-[0.15em] text-white/30">
                      Foto de perfil
                    </label>
                    <div className="flex items-center gap-4">
                      {/* Preview */}
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#4a044e] text-xl font-bold text-white">
                        {localProfilePreview || profilePic ? (
                          <img
                            src={localProfilePreview || profilePic}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          user.fullName.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            className="hidden"
                            onChange={handleProfileFileChange}
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading || isUploadingImage}
                            className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-bold text-white/50 transition-all hover:border-fuchsia-400/30 hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Selecionar arquivo
                          </button>
                          {selectedProfileFile && (
                            <span className="font-mono-dm max-w-[160px] truncate text-[10px] text-white/25">
                              {selectedProfileFile.name}
                            </span>
                          )}
                        </div>
                        <input
                          type="url"
                          placeholder="https://exemplo.com/foto.jpg"
                          className={inputClass}
                          value={profilePic}
                          onChange={(e) => {
                            setProfilePic(e.target.value);
                            setSelectedProfileFile(null);
                            clearLocalPreview();
                          }}
                        />
                        <p className="font-mono-dm text-[9px] text-white/15">
                          Envie um arquivo ou cole uma URL pública.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Email (read-only) */}
                  <div>
                    <label className="font-mono-dm mb-2 block text-[10px] uppercase tracking-[0.15em] text-white/30">
                      E-mail{" "}
                      <span className="text-white/15 normal-case tracking-normal">
                        (permanente)
                      </span>
                    </label>
                    <input
                      type="text"
                      disabled
                      value={user.email}
                      className={inputDisabledClass}
                    />
                  </div>

                  {/* Full name */}
                  <div>
                    <label className="font-mono-dm mb-2 block text-[10px] uppercase tracking-[0.15em] text-white/30">
                      Nome completo
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading || isUploadingImage}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4a044e] py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(74,4,78,0.4)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {isLoading || isUploadingImage ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />{" "}
                        Salvando...
                      </>
                    ) : (
                      "Salvar perfil"
                    )}
                  </button>
                </form>
              )}

              {/* ── TAB: SECURITY ── */}
              {activeTab === "security" && (
                <div className="space-y-5">
                  <div>
                    <label className="font-mono-dm mb-2 block text-[10px] uppercase tracking-[0.15em] text-white/30">
                      Nova senha
                    </label>
                    <input
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="font-mono-dm mb-2 block text-[10px] uppercase tracking-[0.15em] text-white/30">
                      Confirmar nova senha
                    </label>
                    <input
                      type="password"
                      placeholder="Repita a nova senha"
                      className={inputClass}
                    />
                  </div>
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4a044e] py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(74,4,78,0.4)]">
                    Atualizar senha
                  </button>
                </div>
              )}

              {/* ── TAB: PREFS ── */}
              {activeTab === "prefs" && (
                <div className="space-y-6">
                  <div>
                    <label className="font-mono-dm mb-4 block text-[10px] uppercase tracking-[0.15em] text-white/30">
                      Aparência
                    </label>

                    <button
                      type="button"
                      onClick={() => setDarkMode(!darkMode)}
                      className="flex w-full items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3.5 transition-all hover:border-white/[0.12]"
                    >
                      <div className="text-left">
                        <p className="text-sm font-bold text-white/70">
                          {darkMode ? "Modo escuro" : "Modo claro"}
                        </p>
                        <p className="font-mono-dm mt-0.5 text-[10px] text-white/25">
                          {darkMode
                            ? "Interface com fundo escuro"
                            : "Interface com fundo claro"}
                        </p>
                      </div>

                      {/* Toggle */}
                      <div
                        className={`relative h-6 w-11 rounded-full p-0.5 transition-colors ${darkMode ? "bg-[#4a044e]" : "bg-white/10"}`}
                      >
                        <div
                          className={`h-5 w-5 rounded-full bg-white transition-transform ${darkMode ? "translate-x-5" : "translate-x-0"}`}
                        />
                      </div>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-white/[0.05]" />

                  {/* Info row */}
                  <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                    <p className="font-mono-dm mb-1 text-[9px] uppercase tracking-widest text-white/20">
                      versão
                    </p>
                    <p className="text-sm font-bold text-white/40">
                      TaskNest v2.0
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsModal;
