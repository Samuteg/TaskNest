# Banco de dados

PostgreSQL + Drizzle. Schema em `packages/db/src/schema/`, migrations em `packages/db/src/migrations/`.

## Tabelas

### Auth (Better-Auth) — `schema/auth.ts`

`user`, `session`, `account`, `verification` (padrão do Better-Auth).

### `project` — `schema/projects.ts`

| Coluna | Tipo | Notas |
| --- | --- | --- |
| `id` | uuid PK | default random |
| `name` | text | not null |
| `description` | text | nullable |
| `owner_id` | text → user.id | cascade on delete, indexado |
| `created_at` / `updated_at` | timestamp | default now / on update |

### `project_member` — `schema/projects.ts`

| Coluna | Tipo | Notas |
| --- | --- | --- |
| `id` | uuid PK | |
| `project_id` | uuid → project.id | cascade, indexado |
| `user_id` | text → user.id | cascade, indexado |
| `role` | enum `project_role` | `owner` / `admin` / `member`, default `member` |
| unique | `(project_id, user_id)` | um vínculo por usuário/projeto |

### `task` — `schema/tasks.ts`

| Coluna | Tipo | Notas |
| --- | --- | --- |
| `id` | uuid PK | |
| `project_id` | uuid → project.id | cascade, indexado |
| `title` | text | not null |
| `description` | text | nullable |
| `status` | enum `task_status` | `todo` / `in_progress` / `done`, default `todo`, indexado |
| `priority` | enum `task_priority` | `low` / `medium` / `high` / `urgent`, default `medium` |
| `assignee_id` | text → user.id | `set null` on delete, indexado |
| `due_date` | timestamp | nullable |
| `created_at` / `updated_at` | timestamp | |

### `invitation` — `schema/invitations.ts`

Convite por email com projeto, papel, status e expiração. Verifique o schema para os campos exatos.

## Comandos

```bash
bun run db:push      # sincroniza schema (dev)
bun run db:generate  # gera artefatos do drizzle
bun run db:migrate   # aplica migrations (prod)
bun run db:studio    # UI visual
```

## Convenções

- PKs uuid (`defaultRandom`), FKs com `onDelete` explícito (cascade em projeto/membro, set null em assignee).
- Enums no Postgres (`project_role`, `task_status`, `task_priority`) — alterar enum exige migration.
- `updated_at` com `$onUpdate(() => new Date())`.
