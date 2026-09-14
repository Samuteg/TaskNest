# Começando

## Pré-requisitos

- Bun >= 1.4.2 · Docker + Compose · PostgreSQL (local ou gerenciado)

## Passo a passo

```bash
bun install          # instala + postinstall (tipos da api + varlock codegen)
bun run env:generate # após mudar qualquer .env.schema
bun run db:push      # aplica schema no banco (dev)
bun run dev          # web (3001) + server (3000)
```

## Ambiente (.env)

Cada app/pacote tem `.env.schema` versionado; segredos vivem nos `.env` (git-ignored):

- `apps/web/.env` — ex.: `VITE_SERVER_URL=http://localhost:3000`
- `apps/server/.env` — ex.: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `CORS_ORIGIN`
- `packages/db/.env` — ex.: `DATABASE_URL` para push/migrate/studio

O `bunfig.toml` desativa o autoload de env do Bun; o bootstrap do server (Varlock) carrega as vars.

## Rotas do frontend

| Rota | Descrição |
| --- | --- |
| `/` | Landing page |
| `/login` | Login/cadastro |
| `/dashboard` | Lista de projetos |
| `/dashboard/$projectId` | Quadro de tarefas do projeto |
| `/settings` | Configurações gerais |
| `/settings/$projectId` | Configurações do projeto |
