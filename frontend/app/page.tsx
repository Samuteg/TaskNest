import Link from "next/link";
import {
  ArrowUpRight,
  FolderKanban,
  ListTodo,
  Users,
  Zap,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: FolderKanban,
    label: "Projetos",
    description: "Agrupe tarefas por contexto e mantenha o foco onde importa.",
  },
  {
    icon: ListTodo,
    label: "Kanban",
    description: "Pendente → Em progresso → Concluído. Sem fricção.",
  },
  {
    icon: Users,
    label: "Equipe",
    description: "Todos na mesma página. Sem reuniões, sem ruído.",
  },
  {
    icon: Zap,
    label: "Velocidade",
    description:
      "Interface rápida o suficiente para não atrapalhar o seu fluxo.",
  },
];

const stats = [
  { value: "2.4k+", label: "equipes ativas" },
  { value: "98%", label: "satisfação" },
  { value: "0", label: "reuniões extras" },
];

const checks = [
  "Sem cartão de crédito",
  "Setup em menos de 2 minutos",
  "Plano gratuito para sempre",
];

export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

        .font-syne { font-family: 'Syne', sans-serif; }
        .font-mono-dm { font-family: 'DM Mono', monospace; }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        @keyframes float-slow-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(16px) rotate(-2deg); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        .float-a { animation: float-slow 7s ease-in-out infinite; }
        .float-b { animation: float-slow-reverse 9s ease-in-out infinite; }
        .float-c { animation: float-slow 11s ease-in-out infinite 2s; }

        .marquee-track { animation: marquee 22s linear infinite; }

        .fade-up-1 { animation: fade-up 0.7s ease forwards 0.1s; opacity: 0; }
        .fade-up-2 { animation: fade-up 0.7s ease forwards 0.25s; opacity: 0; }
        .fade-up-3 { animation: fade-up 0.7s ease forwards 0.4s; opacity: 0; }
        .fade-up-4 { animation: fade-up 0.7s ease forwards 0.55s; opacity: 0; }

        .pulse-ring {
          animation: pulse-ring 2.5s ease-out infinite;
        }

        .feature-card {
          transition: background 0.25s, transform 0.25s;
        }
        .feature-card:hover {
          background: rgba(255,255,255,0.06);
          transform: translateY(-3px);
        }

        .btn-glow:hover {
          box-shadow: 0 0 32px rgba(74, 4, 78, 0.45);
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

        .grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
      `}</style>

      <div className="noise font-syne min-h-screen bg-[#0d0d0f] text-white overflow-x-hidden">
        <div className="grid-bg min-h-screen">
          {/* ── NAV ── */}
          <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4a044e]">
                <FolderKanban size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Task<span className="text-fuchsia-400">Nest</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:text-white"
              >
                Entrar
              </Link>
              <Link
                href="/signup"
                className="btn-glow rounded-lg border border-[#4a044e]/30 bg-[#4a044e]/10 px-4 py-2 text-sm font-bold text-fuchsia-400 transition-all hover:bg-[#4a044e]/20"
              >
                Criar conta
              </Link>
            </div>
          </nav>

          {/* ── HERO ── */}
          <section className="relative mx-auto max-w-7xl px-6 pt-16 pb-24 md:px-10 md:pt-24">
            {/* Floating geometry */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="float-a absolute right-[8%] top-[5%] h-48 w-48 rounded-full border border-[#4a044e]/10 bg-[#4a044e]/5 blur-sm" />
              <div className="float-b absolute left-[2%] top-[30%] h-32 w-32 rounded-[40%] border border-white/5 bg-white/[0.02]" />
              <div className="float-c absolute right-[15%] bottom-[10%] h-24 w-24 rotate-45 border border-[#4a044e]/15 bg-transparent" />
              <div className="float-a absolute left-[12%] bottom-[20%] h-16 w-16 rounded-full border border-white/10" />

              {/* Large accent circle */}
              <div className="absolute -right-40 top-[-80px] h-[560px] w-[560px] rounded-full bg-[#4a044e]/[0.04]" />
              <div className="absolute -right-40 top-[-80px] h-[560px] w-[560px] rounded-full border border-[#4a044e]/[0.06]" />
            </div>

            <div className="relative z-10 grid items-center gap-16 lg:grid-cols-[1fr_420px]">
              {/* Left — text */}
              <div>
                {/* Eyebrow */}
                <div className="fade-up-1 mb-8 inline-flex items-center gap-2">
                  <span className="font-mono-dm text-[10px] uppercase tracking-[0.2em] text-fuchsia-400/70">
                    v2.0 — agora disponível
                  </span>
                  <span className="h-px w-8 bg-[#4a044e]/30" />
                </div>

                {/* Headline */}
                <h1 className="fade-up-2 mb-6 text-[clamp(48px,7vw,96px)] font-extrabold leading-[0.95] tracking-[-3px] text-white">
                  Trabalho
                  <br />
                  <span className="text-fuchsia-400">organizado.</span>
                  <br />
                  Entrega
                  <br />
                  garantida.
                </h1>

                <p className="fade-up-3 mb-10 max-w-md text-base font-normal leading-relaxed text-white/50">
                  O TaskNest é o sistema de gestão de tarefas que equipes sérias
                  usam para planejar, executar e entregar — sem overhead, sem
                  confusão.
                </p>

                {/* CTAs */}
                <div className="fade-up-4 flex flex-wrap items-center gap-4">
                  <Link
                    href="/signup"
                    className="btn-glow group inline-flex items-center gap-2 rounded-xl bg-[#4a044e] px-6 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                  >
                    Começar de graça
                    <ArrowUpRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm font-medium text-white/40 underline-offset-4 transition-colors hover:text-white/70 hover:underline"
                  >
                    Já tenho conta
                  </Link>
                </div>

                {/* Checks */}
                <ul className="fade-up-4 mt-8 flex flex-wrap gap-x-6 gap-y-2">
                  {checks.map((c) => (
                    <li
                      key={c}
                      className="flex items-center gap-1.5 text-xs font-medium text-white/35"
                    >
                      <CheckCircle2
                        size={12}
                        className="text-fuchsia-400/60 shrink-0"
                      />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right — dashboard mockup */}
              <div className="fade-up-3 relative">
                {/* Glow behind card */}
                <div className="absolute inset-0 -m-8 rounded-[40px] bg-[#4a044e]/5 blur-3xl" />

                <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#131316] shadow-2xl">
                  {/* Mockup header */}
                  <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-3.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                    <span className="ml-3 font-mono-dm text-[10px] text-white/20">
                      tasknest.app / dashboard
                    </span>
                  </div>

                  {/* Mockup body */}
                  <div className="p-5">
                    {/* Project label */}
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-[#4a044e]" />
                        <span className="font-mono-dm text-[11px] font-medium text-white/60">
                          Projeto Alpha
                        </span>
                      </div>
                      <span className="font-mono-dm text-[10px] text-white/20">
                        Sprint 4
                      </span>
                    </div>

                    {/* Kanban columns */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {
                          col: "Pendente",
                          color: "bg-white/10",
                          dot: "bg-white/30",
                          tasks: ["Revisar briefing", "Mapear fluxos"],
                        },
                        {
                          col: "Em andamento",
                          color: "bg-[#4a044e]/10",
                          dot: "bg-[#4a044e]",
                          tasks: ["Design sistema", "API endpoints"],
                          active: true,
                        },
                        {
                          col: "Concluído",
                          color: "bg-emerald-500/10",
                          dot: "bg-emerald-400",
                          tasks: ["Setup repo", "Autenticação"],
                        },
                      ].map(({ col, color, dot, tasks, active }) => (
                        <div key={col} className={`rounded-xl p-3 ${color}`}>
                          <div className="mb-3 flex items-center gap-1.5">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${dot}`}
                            />
                            <span className="font-mono-dm text-[9px] font-medium text-white/40 uppercase tracking-wider">
                              {col}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {tasks.map((t) => (
                              <div
                                key={t}
                                className={`rounded-lg border px-2.5 py-2 text-[10px] font-medium ${active
                                    ? "border-[#4a044e]/20 bg-[#4a044e]/5 text-white/70"
                                    : "border-white/[0.06] bg-white/[0.03] text-white/40"
                                  }`}
                              >
                                {t}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Progress bar */}
                    <div className="mt-5">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="font-mono-dm text-[10px] text-white/30">
                          Progresso geral
                        </span>
                        <span className="font-mono-dm text-[10px] text-fuchsia-400">
                          58%
                        </span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                        <div className="h-full w-[58%] rounded-full bg-[#4a044e]" />
                      </div>
                    </div>

                    {/* Team avatars */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex -space-x-1.5">
                        {["#7c3aed", "#4a044e", "#06b6d4", "#f43f5e"].map(
                          (c, i) => (
                            <div
                              key={i}
                              className="flex h-6 w-6 items-center justify-center rounded-full border border-[#131316] text-[9px] font-bold text-white"
                              style={{ background: c }}
                            >
                              {["A", "B", "C", "D"][i]}
                            </div>
                          ),
                        )}
                      </div>
                      <span className="font-mono-dm text-[10px] text-white/25">
                        4 membros
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#131316] px-3.5 py-2.5 shadow-xl">
                  <div className="relative">
                    <div className="pulse-ring absolute inset-0 rounded-full bg-emerald-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="font-mono-dm text-[11px] text-white/60">
                    2 tarefas entregues hoje
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ── MARQUEE ── */}
          <div className="relative overflow-hidden border-y border-white/[0.05] bg-white/[0.01] py-4">
            <div className="marquee-track flex gap-12 whitespace-nowrap">
              {[...Array(2)].map((_, idx) => (
                <div key={idx} className="flex shrink-0 items-center gap-12">
                  {[
                    "Kanban nativo",
                    "Projetos ilimitados",
                    "Colaboração em tempo real",
                    "Sem limites de tarefas",
                    "Dashboard analítico",
                    "Integrações abertas",
                    "Suporte prioritário",
                  ].map((item) => (
                    <span
                      key={item}
                      className="font-mono-dm text-xs font-medium uppercase tracking-[0.15em] text-white/20"
                    >
                      {item}
                      <span className="ml-12 text-fuchsia-400/30">✦</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* ── STATS ── */}
          <section className="mx-auto max-w-7xl px-6 py-20 md:px-10">
            <div className="grid grid-cols-3 divide-x divide-white/[0.06]">
              {stats.map(({ value, label }) => (
                <div
                  key={label}
                  className="px-8 text-center first:pl-0 last:pr-0"
                >
                  <div className="text-[clamp(36px,5vw,64px)] font-extrabold leading-none tracking-[-2px] text-fuchsia-400">
                    {value}
                  </div>
                  <div className="mt-2 font-mono-dm text-xs text-white/30 uppercase tracking-widest">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── FEATURES ── */}
          <section className="mx-auto max-w-7xl px-6 pb-24 md:px-10">
            <div className="mb-14 flex items-end justify-between">
              <div>
                <p className="font-mono-dm mb-3 text-[10px] uppercase tracking-[0.2em] text-fuchsia-400/50">
                  O que você ganha
                </p>
                <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
                  Tudo que sua
                  <br />
                  equipe precisa.
                </h2>
              </div>
              <Link
                href="/signup"
                className="hidden items-center gap-2 text-sm font-bold text-fuchsia-400 underline-offset-4 hover:underline md:flex"
              >
                Ver tudo <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="grid gap-px bg-white/[0.05] sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, label, description }, i) => (
                <div
                  key={label}
                  className="feature-card group relative bg-[#0d0d0f] p-8"
                >
                  {/* Number */}
                  <span className="font-mono-dm absolute right-6 top-6 text-[11px] text-white/10">
                    0{i + 1}
                  </span>

                  {/* Icon */}
                  <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-fuchsia-400 transition-colors group-hover:border-[#4a044e]/20 group-hover:bg-[#4a044e]/5">
                    <Icon size={18} />
                  </div>

                  <h3 className="mb-2 text-base font-bold text-white">
                    {label}
                  </h3>
                  <p className="text-sm font-normal leading-relaxed text-white/35">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ── CTA FINAL ── */}
          <section className="mx-auto max-w-7xl px-6 pb-24 md:px-10">
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#4a044e] px-10 py-16 text-center md:px-20">
              {/* Decorative inner shapes */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-black/10" />
              <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-black/[0.07]" />

              <div className="relative z-10">
                <p className="font-mono-dm mb-4 text-[10px] uppercase tracking-[0.25em] text-white/50">
                  Comece hoje mesmo
                </p>
                <h2 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
                  Pare de improvisar.
                  <br />
                  Comece a entregar.
                </h2>
                <p className="mx-auto mb-10 max-w-md text-base text-white/60">
                  Crie sua conta gratuitamente e veja sua equipe operar em outro
                  nível a partir de hoje.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/signup"
                    className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-fuchsia-400 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                  >
                    Criar conta grátis
                    <ArrowUpRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Link>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-white/50 underline-offset-4 transition-colors hover:text-white/80 hover:underline"
                  >
                    Já tenho conta
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer className="border-t border-white/[0.05] px-6 py-8 md:px-10">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4a044e]">
                  <FolderKanban size={13} className="text-white" />
                </div>
                <span className="text-sm font-bold text-white/40">
                  Task<span className="text-fuchsia-400/60">Nest</span>
                </span>
              </div>
              <p className="font-mono-dm text-[11px] text-white/20">
                © {new Date().getFullYear()} · Feito com obsessão por qualidade
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
