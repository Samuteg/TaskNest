"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  UserPlus,
  Loader2,
  ArrowLeft,
  FolderKanban,
} from "lucide-react";
import { apiUrl } from "../lib/api";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(apiUrl("/api/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/login?success=account-created");
      } else {
        const data = await response.json();
        setError(data.message || "Erro ao criar conta. Tente outro e-mail.");
      }
    } catch (err) {
      setError("Erro de conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

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
            {/* Back link */}
            <Link
              href="/login"
              className="mb-6 inline-flex items-center gap-1 text-sm font-bold text-gray-500 transition-colors hover:text-fuchsia-700"
            >
              <ArrowLeft size={15} /> Voltar para o login
            </Link>

            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="mb-1.5 text-3xl font-black tracking-tight text-[#1a1a2e]">
                Criar Conta
              </h1>
              <p className="text-sm font-medium text-gray-500">
                Comece a organizar suas tarefas hoje mesmo.
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 rounded-xl border-l-4 border-red-500 bg-red-50 p-4 text-sm font-medium text-red-800">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-bold text-gray-700"
                >
                  Nome Completo
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    required
                    placeholder="Seu nome"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20"
                  />
                </div>
              </div>

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
                    placeholder="exemplo@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-bold text-gray-700"
                >
                  Senha{" "}
                  <span className="font-normal text-gray-400">
                    (mínimo 6 caracteres)
                  </span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20"
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
                    <Loader2 size={18} className="animate-spin" /> Criando
                    conta...
                  </>
                ) : (
                  <>
                    Cadastrar <UserPlus size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-fuchsia-700/10 bg-white/50 px-8 py-5 text-center">
            <p className="text-sm font-medium text-gray-500">
              Já possui uma conta?{" "}
              <Link
                href="/login"
                className="font-bold text-fuchsia-700 transition-colors hover:text-fuchsia-800"
              >
                Entre aqui
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs font-medium text-gray-400">
          Grátis para começar · Sem cartão de crédito
        </p>
      </div>
    </main>
  );
}
