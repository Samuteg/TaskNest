"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Conta criada com sucesso! Agora faça login.");
        router.push("/login"); // <--- A MÁGICA AQUI: Redireciona após sucesso
      } else {
        alert("Erro ao criar conta.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <form onSubmit={handleSignup} className="flex flex-col gap-4 p-8 bg-white shadow-lg rounded-xl">
        <h2 className="text-xl font-bold">Criar Conta</h2>
        <input 
          type="text" placeholder="Nome Completo" className="border p-2 rounded"
          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
        />
        <input 
          type="email" placeholder="E-mail" className="border p-2 rounded"
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        <input 
          type="password" placeholder="Senha" className="border p-2 rounded"
          onChange={(e) => setFormData({...formData, password: e.target.value})}
        />
        <button className="bg-fuchsia-600 text-white p-2 rounded font-bold hover:bg-fuchsia-700">
          Cadastrar
        </button>
        <p className="text-sm">Já tem conta? <a href="/login" className="text-fuchsia-600 underline">Entre aqui</a></p>
      </form>
    </div>
  );
}