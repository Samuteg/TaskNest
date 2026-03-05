import Link from "next/link";
import {
  ArrowRight,
  FolderKanban,
  ListTodo,
  Users,
  Zap,
  Star,
  TrendingUp,
} from "lucide-react";

const highlights = [
  {
    title: "Projetos organizados",
    description: "Agrupe tarefas por projeto e mantenha tudo em contexto.",
    icon: FolderKanban,
    stat: "3x mais rápido",
  },
  {
    title: "Fluxo Kanban",
    description:
      "Acompanhe o progresso com colunas de pendente, em progresso e concluído.",
    icon: ListTodo,
    stat: "0 tarefas perdidas",
  },
  {
    title: "Equipe alinhada",
    description: "Centralize informações para colaborar sem ruído.",
    icon: Users,
    stat: "+40% produtividade",
  },
];

const steps = [
  { number: "01", label: "Crie seu projeto" },
  { number: "02", label: "Adicione sua equipe" },
  { number: "03", label: "Organize no Kanban" },
  { number: "04", label: "Entregue no prazo" },
];

const avatars = [
  { letter: "A", bg: "bg-purple-600" },
  { letter: "B", bg: "bg-fuchsia-600" },
  { letter: "C", bg: "bg-pink-500" },
  { letter: "D", bg: "bg-fuchsia-400" },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#fdf4ff] via-fuchsia-100 to-violet-100 text-gray-900">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed -right-20 -top-28 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(192,38,211,0.15)_0%,transparent_70%)]" />
      <div className="pointer-events-none fixed -bottom-24 -left-16 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.12)_0%,transparent_70%)]" />

      <div className="relative z-10">
        {/* Nav */}
        <nav className="mx-auto flex max-w-[1100px] items-center justify-between px-8 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-gradient-to-br from-fuchsia-700 to-violet-600 shadow-[0_4px_14px_rgba(162,28,175,0.4)]">
              <FolderKanban size={18} className="text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              Task<span className="text-fuchsia-700">Nest</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-[10px] px-[18px] py-[9px] text-sm font-bold text-fuchsia-700 transition-colors hover:bg-fuchsia-700/[0.08]"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              className="rounded-[10px] bg-gradient-to-br from-fuchsia-700 to-violet-600 px-5 py-[9px] text-sm font-bold text-white shadow-[0_4px_14px_rgba(162,28,175,0.35)] transition-all hover:-translate-y-px hover:opacity-90"
            >
              Criar conta
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="mx-auto max-w-[1100px] px-8 pb-20 pt-10">
          {/* Badge */}
          <div className="mb-8 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-700/25 bg-white/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-fuchsia-700 backdrop-blur-sm">
              <Zap size={12} /> Produtividade simplificada
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-5 text-center text-[clamp(36px,6vw,68px)] font-black leading-[1.05] tracking-[-2px] text-[#1a1a2e]">
            Gerencie projetos e tarefas
            <br />
            <span className="bg-gradient-to-br from-fuchsia-700 to-violet-600 bg-clip-text text-transparent">
              em um só lugar
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-[560px] text-center text-[clamp(15px,2vw,18px)] font-medium leading-relaxed text-gray-600">
            O TaskNest ajuda sua equipe a planejar, executar e entregar com mais
            clareza — sem reuniões desnecessárias.
          </p>

          {/* CTAs */}
          <div className="mb-14 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-br from-fuchsia-700 to-violet-600 px-7 py-3.5 text-[15px] font-extrabold text-white shadow-[0_8px_24px_rgba(162,28,175,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(162,28,175,0.5)]"
            >
              Começar agora <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-[14px] border border-fuchsia-700/20 bg-white/85 px-7 py-3.5 text-[15px] font-bold text-fuchsia-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
            >
              Já tenho conta
            </Link>
          </div>

          {/* Social proof */}
          <div className="mb-[72px] flex flex-wrap items-center justify-center gap-3">
            <div className="flex">
              {avatars.map(({ letter, bg }, i) => (
                <div
                  key={i}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white ${bg} ${i > 0 ? "-ml-2" : ""}`}
                >
                  {letter}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>
            <span className="text-[13px] font-semibold text-gray-500">
              +2.400 equipes já usam
            </span>
          </div>

          {/* Feature cards */}
          <div className="mb-[72px] grid grid-cols-1 gap-4 md:grid-cols-3">
            {highlights.map(({ title, description, icon: Icon, stat }) => (
              <div
                key={title}
                className="rounded-[20px] border border-white/90 bg-white/85 p-7 shadow-[0_4px_24px_rgba(162,28,175,0.08),0_1px_4px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(162,28,175,0.16),0_2px_8px_rgba(0,0,0,0.06)]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-700/10 to-violet-600/10">
                  <Icon size={22} className="text-fuchsia-700" />
                </div>
                <p className="mb-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-fuchsia-700">
                  {title}
                </p>
                <p className="mb-4 text-sm font-medium leading-relaxed text-gray-600">
                  {description}
                </p>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-fuchsia-700/8 to-violet-600/8 px-2.5 py-1 text-xs font-bold text-violet-600">
                  <TrendingUp size={11} /> {stat}
                </div>
              </div>
            ))}
          </div>

          {/* Steps */}
          <div className="rounded-3xl border border-fuchsia-700/10 bg-white/70 p-10 shadow-[0_4px_32px_rgba(162,28,175,0.06)] backdrop-blur-xl">
            <p className="mb-7 text-center text-xs font-extrabold uppercase tracking-[0.12em] text-fuchsia-700">
              Como funciona
            </p>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {steps.map((step, i) => (
                <div key={i} className="text-center">
                  <div className="mb-2 bg-gradient-to-br from-fuchsia-700 to-violet-600 bg-clip-text text-[32px] font-black tracking-tight text-transparent">
                    {step.number}
                  </div>
                  <p className="text-sm font-bold text-gray-700">
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <p className="mb-5 text-[13px] font-semibold text-gray-400">
              Grátis para começar · Sem cartão de crédito
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-fuchsia-700 to-violet-600 px-9 py-4 text-base font-extrabold text-white shadow-[0_8px_32px_rgba(162,28,175,0.45)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(162,28,175,0.55)]"
            >
              Criar conta grátis <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-fuchsia-700/10 px-8 py-6 text-center text-[13px] font-medium text-gray-400">
          © {new Date().getFullYear()} TaskNest · Feito com ♥ para equipes
          produtivas
        </footer>
      </div>
    </main>
  );
}
