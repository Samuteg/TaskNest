"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Loader2, X, FolderKanban } from "lucide-react";
import { apiUrl } from "../lib/api";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotFormData, setForgotFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        const data = await response.json();
        setError(data.message || "Credenciais inválidas. Tente novamente.");
      }
    } catch {
      setError("Erro de conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const openForgotPasswordModal = () => {
    setForgotError("");
    setForgotSuccess("");
    setForgotFormData({
      email: formData.email,
      newPassword: "",
      confirmPassword: "",
    });
    setIsForgotModalOpen(true);
  };

  const closeForgotPasswordModal = () => {
    setIsForgotModalOpen(false);
    setForgotError("");
    setForgotSuccess("");
    setForgotFormData({ email: "", newPassword: "", confirmPassword: "" });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (forgotFormData.newPassword !== forgotFormData.confirmPassword) {
      setForgotError("As senhas não coincidem.");
      return;
    }
    if (forgotFormData.newPassword.length < 6) {
      setForgotError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsForgotLoading(true);

    try {
      const response = await fetch(apiUrl("/api/auth/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotFormData.email,
          newPassword: forgotFormData.newPassword,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setForgotSuccess(data.message || "Solicitação enviada com sucesso.");
        setForgotFormData((prev) => ({
          ...prev,
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        setForgotError(data.message || "Não foi possível redefinir a senha.");
      }
    } catch {
      setForgotError("Erro de conexão com o servidor.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  const inputClass =
    "block w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20";

  const modalInputClass =
    "block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20";

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#fdf4ff] via-fuchsia-100 to-violet-100 flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed -right-20 -top-28 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(192,38,211,0.15)_0%,transparent_70%)]" />
      <div className="pointer-events-none fixed -bottom-24 -left-16 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.12)_0%,transparent_70%)]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-gradient-to-br from-fuchsia-700 to-violet-600 shadow-[0_4px_14px_rgba(162,28,175,0.4)]">
            <FolderKanban size={18} className="text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[#1a1a2e]">
            Task<span className="text-fuchsia-700">Nest</span>
          </span>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-[20px] border border-white/90 bg-white/85 shadow-[0_4px_24px_rgba(162,28,175,0.1),0_1px_4px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="mb-1.5 text-3xl font-black tracking-tight text-[#1a1a2e]">
                Bem-vindo de volta!
              </h1>
              <p className="text-sm font-medium text-gray-500">
                Acesse sua conta para gerenciar suas tarefas.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-xl border-l-4 border-red-500 bg-red-50 p-4 text-sm font-medium text-red-800">
                <p className="font-bold">Erro no login</p>
                <p>{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-gray-700"
                >
                  E-mail
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
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
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-bold text-gray-700"
                  >
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={openForgotPasswordModal}
                    className="text-xs font-bold text-fuchsia-700 transition-colors hover:text-fuchsia-800"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-br from-fuchsia-700 to-violet-600 py-3.5 text-sm font-extrabold text-white shadow-[0_8px_24px_rgba(162,28,175,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(162,28,175,0.5)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />{" "}
                    Processando...
                  </>
                ) : (
                  <>
                    Entrar <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-fuchsia-700/10 bg-white/50 px-8 py-5 text-center">
            <p className="text-sm font-medium text-gray-500">
              Não tem uma conta?{" "}
              <Link
                href="/signup"
                className="font-bold text-fuchsia-700 transition-colors hover:text-fuchsia-800"
              >
                Crie agora
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs font-medium text-gray-400">
          Grátis para começar · Sem cartão de crédito
        </p>
      </div>

      {/* Forgot password modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Fechar recuperação de senha"
            onClick={closeForgotPasswordModal}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal card */}
          <div className="relative w-full max-w-md overflow-hidden rounded-[20px] border border-white/90 bg-white/95 shadow-[0_24px_64px_rgba(162,28,175,0.18)] backdrop-blur-xl">
            <div className="p-7">
              {/* Close button */}
              <button
                type="button"
                aria-label="Fechar modal"
                onClick={closeForgotPasswordModal}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-fuchsia-50 hover:text-fuchsia-700"
              >
                <X size={18} />
              </button>

              {/* Modal header */}
              <div className="mb-5">
                <h2 className="text-xl font-black tracking-tight text-[#1a1a2e]">
                  Recuperar senha
                </h2>
                <p className="mt-1 text-sm font-medium text-gray-500">
                  Informe seu e-mail e escolha uma nova senha para redefinir o
                  acesso.
                </p>
              </div>

              {/* Feedback messages */}
              {forgotError && (
                <div className="mb-4 rounded-xl border-l-4 border-red-500 bg-red-50 p-3 text-sm font-medium text-red-800">
                  {forgotError}
                </div>
              )}
              {forgotSuccess && (
                <div className="mb-4 rounded-xl border-l-4 border-emerald-500 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
                  {forgotSuccess}
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label
                    htmlFor="forgot-email"
                    className="mb-2 block text-sm font-bold text-gray-700"
                  >
                    E-mail
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={forgotFormData.email}
                    onChange={(e) =>
                      setForgotFormData({
                        ...forgotFormData,
                        email: e.target.value,
                      })
                    }
                    className={modalInputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-2 block text-sm font-bold text-gray-700"
                  >
                    Nova senha
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="mínimo 6 caracteres"
                    value={forgotFormData.newPassword}
                    onChange={(e) =>
                      setForgotFormData({
                        ...forgotFormData,
                        newPassword: e.target.value,
                      })
                    }
                    className={modalInputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-2 block text-sm font-bold text-gray-700"
                  >
                    Confirmar nova senha
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="repita a nova senha"
                    value={forgotFormData.confirmPassword}
                    onChange={(e) =>
                      setForgotFormData({
                        ...forgotFormData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className={modalInputClass}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={closeForgotPasswordModal}
                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-fuchsia-700 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(162,28,175,0.35)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {isForgotLoading && (
                      <Loader2 size={15} className="animate-spin" />
                    )}
                    Redefinir senha
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
