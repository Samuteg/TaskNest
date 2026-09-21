# TaskNest

Plataforma SaaS de gestao de projetos e tarefas — crie projetos, convide membros com papeis (owner/admin/member), gerencie tarefas com status, prioridade, responsavel e prazo, tudo com API type-safe de ponta a ponta.

**Stack:** React 19 + TanStack Router + Fastify + oRPC + Drizzle + PostgreSQL + Better-Auth, em monorepo Turborepo + Bun.

## Funcionalidades

- **Landing page** (`/`) — hero, CTA, grade de recursos, prova social e footer
- **Autenticacao** — email/senha com Better-Auth (login, cadastro, sessao, dark/light mode)
- **Dashboard** (`/dashboard`) — visao geral dos projetos do usuario
- **Projeto** (`/dashboard/$projectId`) — quadro Kanban com tarefas por status (todo/in_progress/done), prioridade, responsavel e prazo
- **Tags** — tags personalizadas por usuario, filtro no board por tag
- **Comentarios** — thread de comentarios por task com permissoes por papel
- **Membros** — papeis owner/admin/member, alteracao de papel e remocao
- **Convites** — convidar por email, aceitar/recusar, listar pendentes
- **Perfil** — dados do usuario logado
- **Configuracoes** — ajustes gerais e por projeto
- **Docs** — documentacao backend (Fumadocs) e frontend (Astro Starlight)

## Arquitetura

```
TaskNest/
├── apps/
│   ├── web/          Frontend (React 19 + TanStack Router + Vite + Tailwind)
│   ├── server/       Backend API (Fastify + oRPC + OpenAPI)
│   ├── docs/         Documentacao frontend (Astro Starlight)
│   └── fumadocs/     Documentacao backend (Next.js + Fumadocs)
├── packages/
│   ├── api/          Routers oRPC: projects, tasks, members, invitations, profile, tags, comments
│   ├── db/           Schema Drizzle + migrations (PostgreSQL)
│   ├── auth/         Configuracao Better-Auth
│   ├── ui/           shadcn/ui compartilhado + tokens/globals.css
│   └── config/       Config compartilhada (ts, lint)
├── docs/             Guias do projeto (markdown)
└── docker-compose.yml
```

## Comecando

### Pre-requisitos

- [Bun](https://bun.sh) >= 1.4.2
- [Docker](https://www.docker.com) + Docker Compose
- PostgreSQL (local ou gerenciado)

### Instalar

```bash
bun install
```

O `postinstall` gera os routers tipados e o env tipado via Varlock.

### Configurar ambiente

```bash
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
cp packages/db/.env.example packages/db/.env
bun run env:generate   # apos alterar qualquer .env.schema
```

### Banco de dados

```bash
bun run db:push      # aplica schema (dev)
bun run db:generate  # gera client/tipos
bun run db:migrate   # roda migrations (prod)
bun run db:studio    # UI do banco
```

### Rodar

```bash
bun run dev          # web + server (turbo)
bun run dev:web      # so o frontend (porta 3001)
bun run dev:server   # so a API (porta 3000)
```

## Docker

```bash
bun run docker:build  # build das imagens
bun run docker:up     # sobe web + server
bun run docker:logs   # logs
bun run docker:down   # para a stack
```

Variaveis publicas do web sao embutidas no build (`VITE_*`); rede entre containers e resolvida via `docker-compose.yml`.

## Scripts

| Script | Descricao |
| --- | --- |
| `bun run dev` | Sobe tudo em modo dev |
| `bun run build` | Build de todos os apps |
| `bun run check-types` | Checa tipos no monorepo |
| `bun run dev:types` | Watch das declaracoes de `packages/api` |
| `bun run db:push / db:generate / db:migrate / db:studio` | Banco de dados |
| `bun run check` / `bun run fix` | Lint/format (Ultracite/Biome) |
| `bun run docker:build / up / logs / down` | Docker Compose |

## UI compartilhada (shadcn/ui)

Primitivos em `packages/ui`:

- Tokens e estilos globais: `packages/ui/src/styles/globals.css`
- Primitivos: `packages/ui/src/components/*`
- Uso: `import { Button } from "@TaskNest/ui/components/button"`
- Adicionar primitivos: `npx shadcn@latest add accordion dialog popover sheet table -c packages/ui`

## Qualidade de codigo

- Padrao **Ultracite** (Biome): `bun run fix` antes de commitar, `bun run check` no CI
- Hooks: Husky + Lefthook (`bun run prepare` para inicializar)
- Guia completo em [AGENTS.md](AGENTS.md)

## Documentacao

- Guias do projeto: [`docs/`](docs/)
- Docs backend: `apps/fumadocs` (porta 4000)
- Docs frontend: `apps/docs` (porta 4321)

## Contribuindo

1. `bun run prepare` (hooks), crie uma branch a partir de `main`
2. `bun run fix` + `bun run check-types` antes do PR
3. Descreva o que mudou e como testar

## Licenca

Defina a licenca do projeto (ex.: MIT) em `LICENSE`.
