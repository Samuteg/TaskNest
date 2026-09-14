# Arquitetura

## Monorepo (Turborepo + Bun workspaces)

```
apps/web        React 19 + TanStack Router (file-based) + Vite + Tailwind
apps/server     Fastify + oRPC (REST/JSON + OpenAPI) — porta 3000
apps/docs       Astro Starlight
apps/fumadocs   Next.js + Fumadocs
packages/api    Routers oRPC + regras de negócio (fonte de tipos do client)
packages/db     Schema Drizzle + migrations + config
packages/auth   Better-Auth (server + plugins)
packages/ui     shadcn/ui compartilhado + globals.css
packages/config Config compartilhada (ts, lint)
```

## Fluxo de dados

```
web (TanStack Router) ── oRPC client tipado ─▶ server (Fastify)
                                                    │ ctx: sessão + db
                                                    ▼
                                              packages/api routers
                                              (projects, tasks, members,
                                               invitations, profile)
                                                    ▼
                                              packages/db (Drizzle)
                                                    ▼
                                                PostgreSQL
```

- Tipos fluem de `packages/api` para o web sem codegen manual (`postinstall: tsc -b packages/api`).
- Auth: Better-Auth no server; o web usa `auth-client` + sessão em cookie; routers validam sessão/membership por projeto.
- Estilo: tokens em `packages/ui/src/styles/globals.css`; primitivos importados via `@TaskNest/ui/components/*`.

## Decisões

- oRPC em vez de REST manual: contratos type-safe fim a fim + OpenAPI gratuita.
- Drizzle em vez de ORM pesado: schema SQL-like explícito, migrations versionadas.
- Membership checada no servidor a cada operação de projeto/tarefa/convite (nunca só no client).
