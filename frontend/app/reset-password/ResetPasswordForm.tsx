"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { apiUrl } from "../lib/api";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";
  const tokenFromQuery = searchParams.get("token") || "";
  const [formData, setFormData] = useState({
    email: "",
    token: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      email: emailFromQuery,
      token: tokenFromQuery,
    }));
  }, [emailFromQuery, tokenFromQuery]);

  const inputClass =
    "block w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-medium text-white placeholder-white/20 transition-all focus:border-fuchsia-400/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/10";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.email || !formData.token || !formData.newPassword) {
      setError("Preencha e-mail, token e nova senha.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(apiUrl("/api/auth/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          token: formData.token,
          newPassword: formData.newPassword,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Não foi possível redefinir a senha.");
        return;
      }

      setSuccess(data.message || "Senha redefinida com sucesso.");
      setFormData((prev) => ({
        ...prev,
        token: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch {
      setError("Erro de conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-mono-dm { font-family: 'DM Mono', monospace; }
      `}</style>

      <main className="font-syne relative min-h-screen overflow-hidden bg-[#0d0d0f] px-4 py-10 text-white">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/login"
            className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-white/40 transition-all hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-white/70"
          >
            <ArrowLeft size={13} />
            Voltar para login
          </Link>

          <div className="rounded-2xl border border-white/[0.08] bg-[#131316] p-7 shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
            <div className="mb-6">
              <div className="font-mono-dm mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-fuchsia-400/50">
                <span className="h-px w-4 bg-fuchsia-400/30" />
                segurança da conta
              </div>
              <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-white">
                <ShieldCheck size={22} className="text-fuchsia-400" />
                Redefinir senha
              </h1>
              <p className="mt-2 text-sm text-white/30">
                Use o token recebido por e-mail para concluir a redefinição.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-mono-dm mb-2 block text-[10px] uppercase tracking-[0.15em] text-white/30">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="font-mono-dm mb-2 block text-[10px] uppercase tracking-[0.15em] text-white/30">
                  Token de recuperação
                </label>
                <input
                  type="text"
                  required
                  placeholder="Cole o token recebido por e-mail"
                  value={formData.token}
                  onChange={(e) =>
                    setFormData({ ...formData, token: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="font-mono-dm mb-2 block text-[10px] uppercase tracking-[0.15em] text-white/30">
                  Nova senha
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="mínimo 6 caracteres"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="font-mono-dm mb-2 block text-[10px] uppercase tracking-[0.15em] text-white/30">
                  Confirmar nova senha
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="repita a nova senha"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4a044e] px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(74,4,78,0.4)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {isLoading && <Loader2 size={14} className="animate-spin" />}
                Redefinir senha
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
