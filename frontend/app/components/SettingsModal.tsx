import React, { useState, useEffect } from "react";
import {
  X,
  Loader2,
  Users,
  Settings,
  Shield,
  Plus,
  Trash2,
  Moon,
  Sun,
} from "lucide-react";

const SettingsModal = ({
  isOpen,
  onClose,
  user,
  onSuccess,
  darkMode,
  setDarkMode,
}: any) => {
  const [activeTab, setActiveTab] = useState("profile"); // 'profile', 'security', 'prefs'
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Estados para o Avatar
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Sincronizar dados quando o modal abre
  useEffect(() => {
    if (user && isOpen) {
      setFullName(user.fullName);
      if (user.profilePic) {
        setPreviewUrl(user.profilePic);
      } else {
        setPreviewUrl(null);
      }
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      if (selectedFile) formData.append("avatar", selectedFile);

      // A LINHA ABAIXO É A QUE ESTAVA A FALTAR OU COM NOME DIFERENTE:
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      // Agora o 'response' já existe e o erro desaparece
      if (response.ok) {
        const updatedUser = await response.json();
        setMessage({ text: "Perfil atualizado com sucesso!", type: "success" });

        // Atualizamos a imagem com o link que veio do Cloudinary
        setPreviewUrl(updatedUser.profilePic);
        setSelectedFile(null);
        onSuccess();
      } else {
        setMessage({ text: "Erro ao guardar as alterações.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Erro de ligação.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all">
      <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px] border border-gray-100 dark:border-zinc-800">
        {/* --- SIDEBAR DO MODAL --- */}
        <div className="w-full md:w-56 bg-gray-50 dark:bg-zinc-900/50 p-6 border-r border-gray-100 dark:border-zinc-800 flex md:flex-col gap-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all ${activeTab === "profile" ? "bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/30" : "text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800"}`}
          >
            <Users size={18} /> Perfil
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all ${activeTab === "security" ? "bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/30" : "text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800"}`}
          >
            <Shield size={18} /> Segurança
          </button>
          <button
            onClick={() => setActiveTab("prefs")}
            className={`flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all ${activeTab === "prefs" ? "bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/30" : "text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800"}`}
          >
            <Settings size={18} /> Preferências
          </button>
        </div>

        {/* --- CONTEÚDO PRINCIPAL --- */}
        <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 min-w-0">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="text-xl font-black text-gray-900 dark:text-zinc-100 uppercase tracking-tight">
              {activeTab === "profile"
                ? "O Teu Perfil"
                : activeTab === "security"
                  ? "Segurança"
                  : "Definições"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-fuchsia-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {/* Feedback Message */}
            {message.text && (
              <div
                className={`mb-6 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${message.type === "success" ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${message.type === "success" ? "bg-green-500" : "bg-red-500"}`}
                />
                {message.text}
              </div>
            )}

            {/* ABA: PERFIL */}
            {activeTab === "profile" && (
              <form onSubmit={handleUpdateProfile} className="space-y-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-fuchsia-100 dark:border-fuchsia-900/30 bg-gray-100 dark:bg-zinc-800 flex items-center justify-center relative shadow-inner">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover block" // O object-cover é vital aqui!
                          onError={(e) => {
                            // Caso a imagem falhe ao carregar, volta para a inicial
                            (e.target as HTMLImageElement).src = "";
                            setPreviewUrl(null);
                          }}
                        />
                      ) : (
                        <span className="text-4xl font-black text-fuchsia-600">
                          {user.fullName?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-fuchsia-700 text-white p-2.5 rounded-full cursor-pointer hover:bg-fuchsia-800 shadow-xl border-2 border-white dark:border-zinc-900 transition-transform active:scale-90">
                      <Plus size={18} />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  <p className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                    Formatos aceites: JPG, PNG, WEBP
                  </p>
                </div>

                <div className="grid gap-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 dark:text-zinc-500 uppercase mb-2 ml-1">
                      E-mail de Acesso
                    </label>
                    <input
                      type="text"
                      disabled
                      className="w-full p-3.5 bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-2xl text-gray-400 font-bold cursor-not-allowed opacity-70"
                      value={user.email}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 dark:text-zinc-500 uppercase mb-2 ml-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full p-3.5 bg-white dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 rounded-2xl focus:border-fuchsia-600 outline-none font-bold text-gray-900 dark:text-zinc-100 transition-all"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-fuchsia-700 text-white font-black py-4 rounded-2xl hover:bg-fuchsia-800 active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-xl shadow-fuchsia-500/20 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "GUARDAR ALTERAÇÕES"
                  )}
                </button>
              </form>
            )}

            {/* ABA: SEGURANÇA */}
            {activeTab === "security" && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-gray-900 dark:text-zinc-100 uppercase tracking-wider">
                    Alterar Senha
                  </h4>
                  <input
                    type="password"
                    placeholder="Senha Atual"
                    className="w-full p-3.5 bg-white dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 rounded-2xl outline-none focus:border-fuchsia-600 dark:text-zinc-100 font-bold"
                  />
                  <input
                    type="password"
                    placeholder="Nova Senha"
                    className="w-full p-3.5 bg-white dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 rounded-2xl outline-none focus:border-fuchsia-600 dark:text-zinc-100 font-bold"
                  />
                  <button className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black py-4 rounded-2xl hover:opacity-90 transition-all">
                    ATUALIZAR ACESSO
                  </button>
                </div>

                <div className="pt-8 border-t border-gray-100 dark:border-zinc-800">
                  <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-3xl border border-red-100 dark:border-red-900/30">
                    <h4 className="text-red-600 dark:text-red-400 font-black text-xs uppercase mb-2">
                      Zona de Perigo
                    </h4>
                    <p className="text-xs font-bold text-red-500/70 mb-4">
                      Ao apagar a conta, todos os teus projetos e tarefas serão
                      removidos permanentemente.
                    </p>
                    <button className="flex items-center gap-2 text-sm font-black text-white bg-red-600 px-6 py-3 rounded-xl hover:bg-red-700 transition-all">
                      <Trash2 size={16} /> APAGAR CONTA
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ABA: PREFERÊNCIAS */}
            {activeTab === "prefs" && (
              <div className="space-y-6">
                <h4 className="text-sm font-black text-gray-900 dark:text-zinc-100 uppercase tracking-wider">
                  Interface
                </h4>
                <div className="bg-gray-50 dark:bg-zinc-900/50 p-6 rounded-3xl space-y-6 border border-gray-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-gray-900 dark:text-zinc-100">
                        Modo de Visualização
                      </p>
                      <p className="text-xs font-bold text-gray-500 dark:text-zinc-500">
                        Altera entre o tema claro e escuro
                      </p>
                    </div>
                    <button
                      type="button" // Evita submeter o formulário
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation(); // Impede o clique de subir para os pais
                        setDarkMode(!darkMode);
                      }}
                      className={`relative w-14 h-8 rounded-full transition-all duration-300 p-1 ${
                        darkMode ? "bg-fuchsia-600" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center transition-transform duration-300 ${
                          darkMode ? "translate-x-6" : "translate-x-0"
                        }`}
                      >
                        {darkMode ? (
                          <Moon size={12} className="text-fuchsia-600" />
                        ) : (
                          <Sun size={12} className="text-yellow-500" />
                        )}
                      </div>
                    </button>
                  </div>
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
