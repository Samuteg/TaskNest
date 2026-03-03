import React, { useEffect, useState } from "react";
import { X, Loader2, Users, Settings, LayoutDashboard } from "lucide-react";

const SettingsModal = ({
  isOpen,
  onClose,
  user,
  onSuccess,
  darkMode,
  setDarkMode,
}: any) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (user && isOpen) setFullName(user.fullName);
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName }),
        credentials: "include",
      });
      if (response.ok) {
        setMessage({ text: "Perfil atualizado com sucesso!", type: "success" });
        onSuccess();
      } else {
        setMessage({ text: "Erro ao atualizar.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Erro de conexão.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[550px] border border-gray-100 dark:border-zinc-800">
        {/* Sidebar do Modal */}
        <div className="w-full md:w-48 bg-gray-50 dark:bg-zinc-900/50 p-6 border-r border-gray-100 dark:border-zinc-800 flex md:flex-col gap-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 md:flex-none flex items-center gap-2 p-3 rounded-xl text-sm font-bold transition-all ${activeTab === "profile" ? "bg-fuchsia-600 text-white shadow-md" : "text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800"}`}
          >
            <Users size={18} /> <span className="hidden md:inline">Perfil</span>
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex-1 md:flex-none flex items-center gap-2 p-3 rounded-xl text-sm font-bold transition-all ${activeTab === "security" ? "bg-fuchsia-600 text-white shadow-md" : "text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800"}`}
          >
            <Settings size={18} />{" "}
            <span className="hidden md:inline">Segurança</span>
          </button>
          <button
            onClick={() => setActiveTab("prefs")}
            className={`flex-1 md:flex-none flex items-center gap-2 p-3 rounded-xl text-sm font-bold transition-all ${activeTab === "prefs" ? "bg-fuchsia-600 text-white shadow-md" : "text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800"}`}
          >
            <LayoutDashboard size={18} />{" "}
            <span className="hidden md:inline">Preferências</span>
          </button>
        </div>

        {/* Conteúdo Principal do Modal */}
        <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 min-w-0">
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-zinc-100 capitalize">
              {activeTab === "prefs" ? "Preferências" : activeTab}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {message.text && (
              <div
                className={`mb-6 p-3 rounded-xl text-sm font-bold ${message.type === "success" ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"}`}
              >
                {message.text}
              </div>
            )}

            {activeTab === "profile" && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2">
                    E-mail (permanente)
                  </label>
                  <input
                    type="text"
                    disabled
                    className="w-full p-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-400 dark:text-zinc-500 font-medium cursor-not-allowed"
                    value={user.email}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-fuchsia-600 outline-none font-medium text-gray-900 dark:text-zinc-100"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-fuchsia-700 text-white font-bold py-3 rounded-xl hover:bg-fuchsia-800 active:scale-95 transition-all flex justify-center"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Salvar nome"
                  )}
                </button>
              </form>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2">
                    Nova senha
                  </label>
                  <input
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    className="w-full p-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-fuchsia-600 dark:text-zinc-100"
                  />
                </div>
                <button className="w-full bg-gray-900 dark:bg-zinc-700 text-white font-bold py-3 rounded-xl hover:bg-black dark:hover:bg-zinc-600 transition-all">
                  Atualizar senha
                </button>
              </div>
            )}

            {activeTab === "prefs" && (
              <div className="space-y-8">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-zinc-100 mb-4">
                    Aparência
                  </h4>
                  {/* BOTÃO MODO ESCURO */}
                  <button
                    type="button"
                    onClick={() => setDarkMode(!darkMode)}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-bold bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 hover:border-fuchsia-300 dark:hover:border-fuchsia-700 transition-colors"
                  >
                    {darkMode
                      ? "Modo escuro ativado"
                      : "Modo claro ativado"}
                    <div
                      className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center ${darkMode ? "bg-fuchsia-600" : "bg-gray-300 dark:bg-zinc-600"}`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full transition-transform ${darkMode ? "translate-x-6" : "translate-x-0"}`}
                      />
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
