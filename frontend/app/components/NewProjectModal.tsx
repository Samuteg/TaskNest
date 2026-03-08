import React, { useState } from "react";
import { Loader2, X } from "lucide-react";

type NewProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (projectName: string) => Promise<void>;
  isLoading: boolean;
  error: string;
};

const NewProjectModal = ({
  isOpen,
  onClose,
  onCreate,
  isLoading,
  error,
}: NewProjectModalProps) => {
  const [projectName, setProjectName] = useState("");

  if (!isOpen) return null;

  const inputClass =
    "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-medium text-white placeholder-white/20 outline-none transition-all focus:border-fuchsia-400/40 focus:ring-2 focus:ring-fuchsia-400/10";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = projectName.trim();
    if (!trimmedName || isLoading) return;
    await onCreate(trimmedName);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-mono-dm { font-family: 'DM Mono', monospace; }
      `}</style>

      <div
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      >
        <button
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          disabled={isLoading}
          className="absolute inset-0"
        />

        <div className="font-syne relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.07] bg-[#131316] shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
            <div>
              <div className="font-mono-dm mb-0.5 text-[9px] uppercase tracking-[0.2em] text-fuchsia-400/40">
                novo projeto
              </div>
              <h2 className="text-base font-extrabold tracking-tight text-white">
                Criar projeto
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg p-1.5 text-white/20 transition-colors hover:bg-white/[0.05] hover:text-white/50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-400">
                <span className="font-bold">Erro: </span>
                {error}
              </div>
            )}

            <div>
              <label className="font-mono-dm mb-2 block text-[10px] uppercase tracking-[0.15em] text-white/30">
                Nome do projeto <span className="text-fuchsia-400/50">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Ex.: Lançamento Q2"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-white/[0.05] pt-5">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="rounded-xl border border-white/[0.07] px-4 py-2.5 text-sm font-medium text-white/35 transition-all hover:bg-white/[0.04] hover:text-white/60 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || !projectName.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#4a044e] px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(74,4,78,0.4)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Criando...
                  </>
                ) : (
                  "Criar projeto"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default NewProjectModal;
