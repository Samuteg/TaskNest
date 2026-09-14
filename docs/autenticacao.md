# Autenticação

Better-Auth (`packages/auth`), com tabelas `user/session/account/verification` no Postgres.

## Fluxo

1. Usuário cadastra/loga em `/login` (email + senha) via `auth-client` (`apps/web/src/lib/auth-client.ts`).
2. Sessão em cookie http-only; `user-menu`/`header` refletem o estado.
3. Cada request à API leva o cookie; o contexto oRPC (`apps/server/src/context.ts`) resolve sessão + `db`.
4. Routers exigem sessão e, quando há `projectId`, membership válida.

## Papéis de projeto

`owner` > `admin` > `member`:

- **member** — ver projeto, criar/editar tarefas.
- **admin** — tudo do member + convidar, gerenciar membros/tarefas.
- **owner** — tudo do admin + excluir projeto, gerenciar owners.

## Variáveis relevantes

- `BETTER_AUTH_SECRET` — segredo das sessões (server, nunca commitar).
- `CORS_ORIGIN=http://localhost:3001` — liberado para o web em dev (ver `docker-compose.yml`).
- URLs base: dev web `3001`, api `3000` (`VITE_SERVER_URL` no web).
