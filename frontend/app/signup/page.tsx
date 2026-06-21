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
    name: "",
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
      const response = await fetch(apiUrl("/api/auth/core/sign-up/email"), {
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
    } catch {
      setError("Erro de conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "block w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-10 pr-4 text-sm font-medium text-white placeholder-white/20 transition-all focus:border-fuchsia-400/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/10";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-mono-dm { font-family: 'DM Mono', monospace; }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(3deg); }
        }
        @keyframes float-slow-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(14px) rotate(-2deg); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .float-a { animation: float-slow 7s ease-in-out infinite; }
        .float-b { animation: float-slow-reverse 9s ease-in-out infinite; }
        .float-c { animation: float-slow 11s ease-in-out infinite 1.5s; }

        .fade-up-1 { animation: fade-up 0.6s ease forwards 0.05s; opacity: 0; }
        .fade-up-2 { animation: fade-up 0.6s ease forwards 0.15s; opacity: 0; }
        .fade-up-3 { animation: fade-up 0.6s ease forwards 0.25s; opacity: 0; }

        .grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        .noise::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
          z-index: 100;
        }

        .btn-fuchsia-glow:hover {
          box-shadow: 0 0 28px rgba(74, 4, 78, 0.5);
        }

        .input-icon { color: rgba(255,255,255,0.25); }
      `}</style>

      <main className="noise font-syne relative min-h-screen overflow-hidden bg-[#0d0d0f] text-white">
        <div className="grid-bg min-h-screen flex flex-col">
          {/* Floating geometry */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden">
            <div className="float-a absolute left-[5%] top-[10%] h-52 w-52 rounded-full border border-[#4a044e]/10 bg-[#4a044e]/5 blur-sm" />
            <div className="float-b absolute right-[4%] bottom-[12%] h-40 w-40 rounded-[40%] border border-white/[0.04] bg-white/[0.01]" />
            <div className="float-c absolute right-[10%] top-[18%] h-16 w-16 rotate-12 border border-[#4a044e]/10" />
            <div className="float-b absolute left-[15%] bottom-[25%] h-10 w-10 rounded-full border border-white/[0.06]" />
            <div className="absolute -right-32 top-[-60px] h-[480px] w-[480px] rounded-full bg-[#4a044e]/[0.06]" />
            <div className="absolute -left-40 bottom-[-80px] h-[400px] w-[400px] rounded-full bg-[#4a044e]/[0.04]" />
          </div>

          {/* ── TOP NAV ── */}
          <nav className="relative z-10 flex items-center justify-between px-6 py-6 md:px-10">
            {/* Back to landing */}
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-white/40 transition-all hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-white/70"
            >
              <ArrowLeft
                size={13}
                className="transition-transform group-hover:-translate-x-0.5"
              />
              Voltar ao início
            </Link>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4a044e]">
                <FolderKanban size={13} className="text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight">
                Task<span className="text-fuchsia-400">Nest</span>
              </span>
            </div>
          </nav>

          {/* ── MAIN CONTENT ── */}
          <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
            <div className="w-full max-w-sm">
              {/* Eyebrow */}
              <div className="fade-up-1 mb-6 flex items-center gap-2">
                <span className="font-mono-dm text-[10px] uppercase tracking-[0.2em] text-fuchsia-400/60">
                  novo por aqui
                </span>
                <span className="h-px flex-1 bg-white/[0.06]" />
              </div>

              {/* Headline */}
              <div className="fade-up-2 mb-8">
                <h1 className="text-4xl font-extrabold leading-[1.0] tracking-[-2px] text-white">
                  Crie sua
                  <br />
                  <span className="text-fuchsia-400">conta grátis.</span>
                </h1>
                <p className="mt-3 text-sm font-normal text-white/35">
                  Setup em menos de 2 minutos. Sem cartão de crédito.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-400">
                  <span className="font-bold">Erro: </span>
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="fade-up-3 space-y-4">
                {/* Full name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="font-mono-dm mb-2 block text-[10px] uppercase tracking-[0.15em] text-white/30"
                  >
                    Nome completo
                  </label>
                  <div className="relative">
                    <div className="input-icon pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <User size={16} />
                    </div>
                    <input
                      id="fullName"
                      type="text"
                      required
                      placeholder="Seu nome"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="font-mono-dm mb-2 block text-[10px] uppercase tracking-[0.15em] text-white/30"
                  >
                    E-mail
                  </label>
                  <div className="relative">
                    <div className="input-icon pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail size={16} />
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
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="font-mono-dm mb-2 block text-[10px] uppercase tracking-[0.15em] text-white/30"
                  >
                    Senha{" "}
                    <span className="text-white/15 normal-case tracking-normal">
                      (mín. 6 caracteres)
                    </span>
                  </label>
                  <div className="relative">
                    <div className="input-icon pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock size={16} />
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
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-fuchsia-glow mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4a044e] py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Criando
                      conta...
                    </>
                  ) : (
                    <>
                      Cadastrar <UserPlus size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Divider + login */}
              <div className="mt-8 flex items-center gap-4">
                <span className="h-px flex-1 bg-white/[0.06]" />
                <span className="font-mono-dm text-[10px] text-white/20">
                  ou
                </span>
                <span className="h-px flex-1 bg-white/[0.06]" />
              </div>

              <p className="mt-6 text-center text-sm text-white/30">
                Já possui uma conta?{" "}
                <Link
                  href="/login"
                  className="font-bold text-fuchsia-400 transition-colors hover:text-fuchsia-300"
                >
                  Entre aqui
                </Link>
              </p>
            </div>
          </div>

          {/* ── FOOTER ── */}
          <footer className="relative z-10 border-t border-white/[0.04] px-6 py-5 text-center">
            <p className="font-mono-dm text-[10px] text-white/15">
              © {new Date().getFullYear()} TaskNest · Grátis para sempre no
              plano básico
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
