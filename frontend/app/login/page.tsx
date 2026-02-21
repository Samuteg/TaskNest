"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", { // Ajuste para a sua URL real
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        // Importante para salvar o cookie de sessão/JWT que seu backend envia
        credentials: "include", 
      });

      if (response.ok) {
        // Se o login deu certo, redireciona para a Dashboard
        router.push("/"); 
      } else {
        const data = await response.json();
        setError(data.message || "Falha no login. Verifique suas credenciais.");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form 
        onSubmit={handleSubmit} 
        className="p-8 bg-white shadow-md rounded-xl w-full max-w-md"
      >
        <h1 className="mb-6 text-2xl font-bold text-gray-800 text-center">Login</h1>
        
        {error && <p className="mb-4 text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>}

        <div className="space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full p-3 font-semibold text-white transition-colors bg-fuchsia-600 rounded-lg hover:bg-fuchsia-700"
          >
            Entrar
          </button>
        </div>
      </form>
    </div>
  );
}