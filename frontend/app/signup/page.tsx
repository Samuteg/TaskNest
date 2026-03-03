"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, UserPlus, Loader2, ArrowLeft } from "lucide-react";
import { apiUrl } from "../lib/api";

export default function SignupPage() {
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Chamada para sua rota de signup no Node.js
      const response = await fetch(apiUrl("/api/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Fluxo: Cadastro bem sucedido -> Vai para o Login
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-fuchsia-50 to-gray-200 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <div className="p-8 sm:p-10">
          
          {/* Botão Voltar */}
          <Link href="/login" className="inline-flex items-center text-sm font-bold text-gray-600 hover:text-fuchsia-700 mb-6 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Voltar para o login
          </Link>

          {/* Cabeçalho */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Criar Conta</h1>
            <p className="text-base text-gray-700">Comece a organizar suas tarefas hoje mesmo.</p>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 text-red-900 text-sm rounded font-medium">
              {error}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Campo Nome Completo */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-900 mb-2">
                Nome Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <User size={20} />
                </div>
                <input
                  id="fullName"
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-400 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-fuchsia-600 focus:border-fuchsia-600 sm:text-base transition-all font-medium"
                  placeholder="Seu nome"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

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
                  className="block w-full pl-10 pr-3 py-3 border border-gray-400 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-fuchsia-600 focus:border-fuchsia-600 sm:text-base transition-all font-medium"
                  placeholder="exemplo@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Campo de Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                Senha (mínimo 6 caracteres)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Lock size={20} />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-400 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-fuchsia-600 focus:border-fuchsia-600 sm:text-base transition-all font-medium"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {/* Botão de Cadastro */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 mt-4 py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-bold text-white bg-fuchsia-700 hover:bg-fuchsia-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Criando conta...
                </>
              ) : (
                <>
                  Cadastrar <UserPlus size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Rodapé */}
        <div className="px-8 py-6 bg-gray-100 border-t border-gray-200 text-center">
          <p className="text-base text-gray-800">
            Já possui uma conta?{" "}
            <Link href="/login" className="font-bold text-fuchsia-700 hover:text-fuchsia-800 transition-colors">
              Entre aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
