# TaskNest 🪹

Plataforma SaaS de **gestão de projetos e tarefas** — crie projetos, convide membros com papéis (owner/admin/member), gerencie tarefas com status, prioridade, responsável e prazo, tudo com API type-safe de ponta a ponta.

> Stack: **React 19 + TanStack Router + Fastify + oRPC + Drizzle + PostgreSQL + Better-Auth**, em monorepo **Turborepo + Bun**.

## ✨ Funcionalidades

- **Landing page** (`/`) — hero, CTA, grade de recursos, prova social e footer
- **Autenticação** — email/senha com Better-Auth (login, cadastro, sessão, menu do usuário, dark/light mode)
- **Dashboard** (`/dashboard`) — visão geral dos projetos do usuário
- **Projeto** (`/dashboard/$projectId`) — quadro de tarefas por status (`todo` / `in_progress` / `done`), com prioridade (`low` / `medium` / `high` / `urgent`), responsável e data de entrega
- **Membros** — papéis `owner` / `admin` / `member`, alteração de papel e remoção
- **Convites** — convidar por email, aceitar/recusar, listar pendentes
- **Perfil** — dados do usuário logado
- **Configurações** — ajustes gerais e por projeto
- **Docs** — site de documentação (Astro Starlight em `apps/docs` + Fumadocs em `apps/fumadocs`)

## 🧱 Arquitetura / Monorepo

```
TaskNest/
├── apps/
│   ├── web/        # Frontend (React 19 + TanStack Router + Vite + Tailwind)
│   ├── server/     # Backend API (Fastify + oRPC + OpenAPI)
│   ├── docs/       # Site de docs (Astro Starlight)
│   └── fumadocs/   # Site de docs alternativo (Next.js + Fumadocs)
├── packages/
│   ├── api/        # Routers oRPC: projects, tasks, members, invitations, profile
│   ├── db/         # Schema Drizzle + migrations (PostgreSQL)
│   ├── auth/       # Configuração Better-Auth
│   ├── ui/         # shadcn/ui compartilhado + tokens/globals.css
│   └── config/     # Config compartilhada
├── docs/           # Documentação do projeto (guias em Markdown)
└── docker-compose.yml  # Stack web + server
```

**Modelo de dados (PostgreSQL + Drizzle):**

| Tabela | Descrição |
| --- | --- |
| `user`, `session`, `account`, `verification` | Better-Auth |
| `project` | `id`, `name`, `description`, `owner_id`, timestamps |
| `project_member` | `project_id`, `user_id`, `role` (`owner`/`admin`/`member`), único por par projeto+usuário |
| `task` | `project_id`, `title`, `description`, `status` (`todo`/`in_progress`/`done`), `priority` (`low`/`medium`/`high`/`urgent`), `assignee_id`, `due_date` |
| `invitation` | convites por email com status e expiração |

Detalhes em [`docs/arquitetura.md`](docs/arquitetura.md) e [`docs/banco-de-dados.md`](docs/banco-de-dados.md).

## 🚀 Começando

### Pré-requisitos

- [Bun](https://bun.sh) `>= 1.4.2`
- [Docker](https://www.docker.com) + Docker Compose (para rodar via containers)
- PostgreSQL (local ou via `db:push` contra um banco existente)

### 1. Instalar dependências

```bash
bun install
```

O `postinstall` gera os routers tipados (`tsc -b packages/api`) e o `env` tipado via Varlock.

### 2. Configurar ambiente

Cada app tem seu `.env.schema` (versionado). Segredos ficam nos `.env` (ignorados pelo git) ou na plataforma de deploy:

```bash
cp apps/server/.env.example apps/server/.env   # se existir; senão crie a partir do schema
cp apps/web/.env.example apps/web/.env
cp packages/db/.env.example packages/db/.env
bun run env:generate   # após alterar qualquer .env.schema
```

> O carregamento automático de env do Bun está desativado em `bunfig.toml`; quem carrega é o bootstrap do server (Varlock) / integração do framework.

### 3. Banco de dados

```bash
bun run db:push      # aplica o schema (dev)
bun run db:generate  # gera client/tipos
bun run db:migrate   # roda migrations (prod)
bun run db:studio    # UI do banco
```

### 4. Rodar em desenvolvimento

```bash
bun run dev          # web + server (turbo)
bun run dev:web      # só o frontend
bun run dev:server   # só a API
```

- Web: http://localhost:3001
- API: http://localhost:3000

## 🐳 Docker

```bash
bun run docker:build  # build das imagens
bun run docker:up     # sobe web + server
bun run docker:logs   # logs
bun run docker:down   # para a stack
```

Variáveis públicas do web são embutidas no build (`VITE_*`); rede entre containers é resolvida via `docker-compose.yml`.

## 📜 Scripts

| Script | O que faz |
| --- | --- |
| `bun run dev` | Sobe tudo em modo dev |
| `bun run build` | Build de todos os apps |
| `bun run check-types` | Checa tipos no monorepo |
| `bun run dev:types` | Watch das declarações de `packages/api` |
| `bun run db:push / db:generate / db:migrate / db:studio` | Banco de dados |
| `bun run check` / `bun run fix` | Lint/format (Ultracite/Biome) |
| `bun run docker:build / up / logs / down` | Docker Compose |
| `cd apps/docs && bun run dev` | Site de docs Starlight |

## 🎨 UI compartilhada (shadcn/ui)

Primitivos ficam em `packages/ui`:

- Tokens e estilos globais: `packages/ui/src/styles/globals.css`
- Primitivos: `packages/ui/src/components/*`
- Uso: `import { Button } from "@TaskNest/ui/components/button"`
- Adicionar primitivos: `npx shadcn@latest add accordion dialog popover sheet table -c packages/ui`
- Blocos só do app web: rode o shadcn CLI dentro de `apps/web`

## ✅ Qualidade de código

- Padrão **Ultracite** (Biome por baixo): `bun run fix` antes de commitar, `bun run check` no CI
- Hooks: Husky + Lefthook (`bun run prepare` para inicializar)
- Guia completo em [`AGENTS.md`](AGENTS.md)

## 📚 Documentação

- Guias do projeto: [`docs/`](docs/) — [índice](docs/indice.md)
  - [Começando](docs/comecando.md) · [Arquitetura](docs/arquitetura.md) · [Banco de dados](docs/banco-de-dados.md) · [API](docs/api.md) · [Autenticação](docs/autenticacao.md) · [Deploy](docs/deploy.md)
- Site Starlight: `apps/docs` · Site Fumadocs: `apps/fumadocs`

## 🤝 Contribuindo

1. `bun run prepare` (hooks), crie uma branch a partir de `main`
2. `bun run fix` + `bun run check-types` antes do PR
3. Descreva o que mudou e como testar

## 📄 Licença

Defina a licença do projeto (ex.: MIT) em `LICENSE`.
