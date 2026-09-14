# API

Backend: Fastify + oRPC (`apps/server`), regras em `packages/api/src/routers/`. O client web (`apps/web/src/utils/orpc.ts`) é tipado de ponta a ponta.

## Routers

### `projects.ts`

- Criar projeto (vira `owner` + membro automaticamente)
- Listar meus projetos (via membership)
- Detalhar projeto (só membros)
- Atualizar (owner/admin) · Excluir (owner)

### `tasks.ts`

- Criar tarefa no projeto (membros)
- Listar por projeto (filtro por status)
- Atualizar status/prioridade/título/descrição/responsável/prazo
- Excluir (conforme papel)

### `members.ts`

- Listar membros do projeto
- Alterar papel `member ↔ admin` (owner/admin; owner não rebaixa a si se for o último)
- Remover membro (owner/admin; owner original protegido)

### `invitations.ts`

- Convidar por email (gera convite com papel + expiração)
- Listar convites pendentes (do usuário / do projeto)
- Aceitar (cria membership) / Recusar / Cancelar

### `profile.ts`

- Dados do usuário logado / atualização de perfil

## Autorização (resumo)

| Ação | Quem pode |
| --- | --- |
| Ler projeto/tarefas | membro do projeto |
| Criar/editar tarefa | membro do projeto |
| Convidar / gerenciar membros | admin ou owner |
| Excluir projeto | owner |
| Aceitar convite | dono do email convidado |

Toda checagem acontece no servidor via `projectMember` + sessão Better-Auth. O frontend esconde UI, mas a autoridade é o backend.

## OpenAPI

O server expõe o spec OpenAPI gerado pelo oRPC (útil para Insomnia/Postman). Confira `apps/server/src/index.ts` para o path exato.
