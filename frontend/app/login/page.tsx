"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Loader2, X } from "lucide-react";
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
        router.push("/");
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
        setForgotFormData((prev) => ({ ...prev, newPassword: "", confirmPassword: "" }));
      } else {
        setForgotError(data.message || "Não foi possível redefinir a senha.");
      }
    } catch {
      setForgotError("Erro de conexão com o servidor.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-fuchsia-50 to-gray-200 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <div className="p-8 sm:p-10">
          {/* Cabeçalho */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Bem-vindo de volta!</h1>
            <p className="text-base text-gray-700">Acesse sua conta para gerenciar suas tarefas.</p>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 text-red-900 text-sm rounded">
              <p className="font-bold">Erro no login</p>
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Mail size={20} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-400 rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-600 focus:border-fuchsia-600 sm:text-base transition-all font-medium"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Campo de Senha */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-900">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={openForgotPasswordModal}
                  className="text-sm font-bold text-fuchsia-700 hover:text-fuchsia-800 transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Lock size={20} />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-400 rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-600 focus:border-fuchsia-600 sm:text-base transition-all font-medium"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-bold text-white bg-fuchsia-700 hover:bg-fuchsia-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Processando...
                </>
              ) : (
                <>
                  Entrar <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Rodapé do Cartão */}
        <div className="px-8 py-6 bg-gray-100 border-t border-gray-200 text-center">
          <p className="text-base text-gray-800">
            Não tem uma conta?{" "}
            <Link href="/signup" className="font-bold text-fuchsia-700 hover:text-fuchsia-800 transition-colors">
              Crie agora
            </Link>
          </p>
        </div>
      </div>

      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fechar recuperação de senha"
            onClick={closeForgotPasswordModal}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
            <button
              type="button"
              aria-label="Fechar modal"
              onClick={closeForgotPasswordModal}
              className="absolute right-4 top-4 rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={18} />
            </button>

            <h2 className="text-2xl font-bold text-gray-900">Recuperar senha</h2>
            <p className="mt-2 text-sm text-gray-700">
              Informe seu e-mail e escolha uma nova senha para redefinir o acesso.
            </p>

            {forgotError && (
              <div className="mt-4 rounded border-l-4 border-red-600 bg-red-50 p-3 text-sm text-red-900">
                {forgotError}
              </div>
            )}
            {forgotSuccess && (
              <div className="mt-4 rounded border-l-4 border-emerald-600 bg-emerald-50 p-3 text-sm text-emerald-900">
                {forgotSuccess}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="mt-5 space-y-4">
              <div>
                <label htmlFor="forgot-email" className="mb-2 block text-sm font-semibold text-gray-900">
                  E-mail
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  className="block w-full rounded-lg border border-gray-400 bg-white px-3 py-3 text-base text-gray-900 placeholder-gray-500 transition-all focus:border-fuchsia-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                  placeholder="seu@email.com"
                  value={forgotFormData.email}
                  onChange={(e) => setForgotFormData({ ...forgotFormData, email: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="new-password" className="mb-2 block text-sm font-semibold text-gray-900">
                  Nova senha
                </label>
                <input
                  id="new-password"
                  type="password"
                  required
                  minLength={6}
                  className="block w-full rounded-lg border border-gray-400 bg-white px-3 py-3 text-base text-gray-900 placeholder-gray-500 transition-all focus:border-fuchsia-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                  placeholder="mínimo 6 caracteres"
                  value={forgotFormData.newPassword}
                  onChange={(e) => setForgotFormData({ ...forgotFormData, newPassword: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="mb-2 block text-sm font-semibold text-gray-900">
                  Confirmar nova senha
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  minLength={6}
                  className="block w-full rounded-lg border border-gray-400 bg-white px-3 py-3 text-base text-gray-900 placeholder-gray-500 transition-all focus:border-fuchsia-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                  placeholder="repita a nova senha"
                  value={forgotFormData.confirmPassword}
                  onChange={(e) => setForgotFormData({ ...forgotFormData, confirmPassword: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForgotPasswordModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-fuchsia-700 px-4 py-2 font-semibold text-white hover:bg-fuchsia-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isForgotLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                  Redefinir senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
