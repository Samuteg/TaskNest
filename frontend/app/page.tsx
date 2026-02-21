"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./components/SideBar"; // Mova o componente Sidebar para uma pasta separada depois

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/check", {
          method: "GET",
          credentials: "include", // ESSENCIAL para cookies/sessão
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          // Se o backend negar (401), vai para o login
          router.push("/login");
        }
      } catch (err) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (loading) return <div className="flex h-screen items-center justify-center">Carregando Dashboard...</div>;
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Suas Tarefas</h1>
        {/* Grid de Tasks aqui (como fizemos antes) */}
      </main>
    </div>
  );
}
