# TaskNest Fixes + Tags + Comments + Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir header/auth-CTA/fluxo landing↔dashboard, adicionar tags globais por usuário e comments thread completa, separar settings conta vs projeto.

**Architecture:** DB normalizado novo (`tag`, `task_tag`, `task_comment`) + routers oRPC `tags`/`comments` + extensão `tasks.list/setTags`; UI auth-aware via `authClient.useSession()`; settings por rota (`/settings` conta, `/dashboard/$projectId/settings` projeto).

**Tech Stack:** React 19 + TanStack Router + Vite + Tailwind, Fastify + oRPC + TanStack Query, Drizzle + PostgreSQL, Better-Auth, Bun + Turbo, Ultracite/Biome.

**Spec:** design aprovado em chat (header grid, auth-CTA Dashboard, tags global usuário, comments CRUD autor/admin, settings split).

## Global Constraints

- Bun `1.4.2`, `packageManager bun@1.4.2`.
- Não adicionar deps novas; usar `drizzle-orm`, `zod`, `@TaskNest/ui`, `lucide-react`, `sonner`.
- Rotas TanStack file-based em `apps/web/src/routes/`; não quebrar `_auth/route.tsx` guard.
- Permissão: `requireMember` existente; `member` só edita própria task; comments autor ou `owner/admin`.
- `bun run fix` antes commit, `bun run check-types` verde.
- Sem comentários de código triviais.

## Rulings (já decididas — cumprir ao implementar)

1. **Ciclo de imports Drizzle:** NÃO importar `tags.ts` de `tasks.ts`. Mover `taskRelations` de `packages/db/src/schema/tasks.ts` para novo `packages/db/src/schema/relations.ts` (importa `task`, `taskTag`, `taskComment`, `user`, `project`), junto com `taskTagRelations` e `taskCommentRelations`. `schema/index.ts` exporta `./relations` por último. `tags.ts`/`comments.ts` só definem tabelas.
2. **Shape do API `tasks.list`:** achatar tags no handler — cada task retorna `tags: { id: string; name: string; color: string }[]` (mapear `taskTags` antes de retornar). `tasks.get` idem. UI usa `task.tags`, nunca `taskTags`.
3. **Escopo de tags:** globais por usuário (criador). Qualquer membro pode anexar as PRÓPRIAS tags a tasks do projeto; `tags.list` filtra por `userId` da sessão. Filtro de board mostra apenas as tags do usuário logado (decisão do usuário).
4. **Filtro de tags no board:** client-side sobre `tasks.data` (dados já contêm `tags`); o parâmetro `tagIds` do `tasks.list` existe mas a UI de board não o usa.
5. **Sem suite de testes:** repo não tem runner configurado; verificação = `bun run check-types` + `bun run check` + QA manual descrito nos steps.

---

### Task 1: Header centrado + CTA auth-aware landing

**Files:**
- Modify: `apps/web/src/components/header.tsx:26-71`
- Create: `apps/web/src/components/landing/auth-cta.tsx`
- Modify: `apps/web/src/components/landing/hero.tsx:37-46`
- Modify: `apps/web/src/components/landing/cta-section.tsx:30-36`

**Interfaces:**
- Consumes: `authClient.useSession()` de `@/lib/auth-client`.
- Produces: `AuthCta({ compact }: { compact?: boolean })` — logado: Link `/dashboard` "Go to Dashboard"; não logado: Link `/login` "Try Demo" (compact) / "Try the Demo" (cheio).

- [ ] **Step 1: Criar `auth-cta.tsx`**

```tsx
import { Button } from "@TaskNest/ui/components/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { authClient } from "@/lib/auth-client";

export function AuthCta({ compact = false }: { compact?: boolean }) {
	const { data: session, isPending } = authClient.useSession();
	if (isPending) {
		return null;
	}
	if (session) {
		return (
			<Link to="/dashboard">
				<Button size={compact ? "sm" : "lg"} className="gap-2 font-semibold text-sm">
					<span>Go to Dashboard</span>
					<ArrowRight className="h-4 w-4" />
				</Button>
			</Link>
		);
	}
	return (
		<Link to="/login">
			<Button size={compact ? "sm" : "lg"} className="gap-2 font-semibold text-sm">
				<span>{compact ? "Try Demo" : "Try the Demo"}</span>
				<ArrowRight className="h-4 w-4" />
			</Button>
		</Link>
	);
}
```

- [ ] **Step 2: Corrigir `header.tsx` — grid com centro real**

Trocar `<div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4">` por `<div className="container mx-auto grid h-14 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4">`; logo com `justify-self-start`; nav de landing com `justify-self-center` (renderizar `<div />` placeholder quando `!isLanding` para manter a coluna central); bloco de ações com `justify-self-end`. Substituir o `<Link to="/login"><Button size="sm">Try Demo</Button></Link>` por `<AuthCta compact />` (renderizar sempre, não só `isLanding`). Manter botão GitHub apenas em `isLanding`.

- [ ] **Step 3: Hero e CtaSection usam `AuthCta`**

`hero.tsx:37-46`: trocar bloco `<Link to="/login">…Try the Demo…</Link>` por `<AuthCta />` (manter botão GitHub). `cta-section.tsx:30-36`: trocar `<Link className="flex-1" to="/login">…</Link>` por `<div className="flex-1"><AuthCta /></div>` mantendo layout flex.

- [ ] **Step 4: Verificar tipos/lint**

Run: `bun run check-types` → PASS. `bun x ultracite check apps/web/src/components/header.tsx apps/web/src/components/landing/auth-cta.tsx apps/web/src/components/landing/hero.tsx apps/web/src/components/landing/cta-section.tsx` → PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/header.tsx apps/web/src/components/landing/auth-cta.tsx apps/web/src/components/landing/hero.tsx apps/web/src/components/landing/cta-section.tsx
git commit -m "fix(web): center header nav and auth-aware CTA"
```

### Task 2: Fluxo Landing ⇄ Dashboard sem perder sessão

**Files:**
- Modify: `apps/web/src/routes/login.tsx`
- Modify: `apps/web/src/components/user-menu.tsx:25-64`

**Interfaces:**
- Consumes: `authClient.getSession()`, `authClient.useSession()`.
- Produces: `/login` com `beforeLoad` redirect `/dashboard` se sessão; dropdown com itens `Dashboard` e `Account Settings`.

- [ ] **Step 1: Guard em `login.tsx`**

```tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/login")({
	beforeLoad: async () => {
		const s = await authClient.getSession();
		if (s.data) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: RouteComponent,
});
```

(Manter `RouteComponent` atual.)

- [ ] **Step 2: `user-menu.tsx` — itens Dashboard + Account Settings**

Dentro de `DropdownMenuGroup`, após o label/email, antes de Sign Out:

```tsx
<DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })}>
	Dashboard
</DropdownMenuItem>
<DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
	Account Settings
</DropdownMenuItem>
```

- [ ] **Step 3: Verificação**

Run: `bun run check-types` → PASS. QA manual: logado, `/` mostra "Go to Dashboard"; `/login` redireciona `/dashboard`; dropdown tem Dashboard.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/routes/login.tsx apps/web/src/components/user-menu.tsx
git commit -m "fix(web): auth flow landing-dashboard-login redirect"
```

### Task 3: DB schema tags globais + comments

**Files:**
- Create: `packages/db/src/schema/tags.ts`
- Create: `packages/db/src/schema/comments.ts`
- Create: `packages/db/src/schema/relations.ts`
- Modify: `packages/db/src/schema/tasks.ts` (remover `taskRelations`)
- Modify: `packages/db/src/schema/index.ts`

**Interfaces:**
- Consumes: `user.id`, `task.id`, `project.id`.
- Produces: tabelas `tag`, `taskTag`, `taskComment`; relations `taskRelations` (com `taskTags`), `taskTagRelations`, `taskCommentRelations`, `tagRelations` exportadas de `relations.ts`.

- [ ] **Step 1: `packages/db/src/schema/tags.ts`**

```ts
import {
	index,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { task } from "./tasks";

export const tag = pgTable(
	"tag",
	{
		color: text("color").default("#6366f1").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		id: uuid("id").defaultRandom().primaryKey(),
		name: text("name").notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [
		uniqueIndex("tag_userId_name_uidx").on(table.userId, table.name),
		index("tag_userId_idx").on(table.userId),
	]
);

export const taskTag = pgTable(
	"task_tag",
	{
		tagId: uuid("tag_id")
			.notNull()
			.references(() => tag.id, { onDelete: "cascade" }),
		taskId: uuid("task_id")
			.notNull()
			.references(() => task.id, { onDelete: "cascade" }),
	},
	(table) => [primaryKey({ columns: [table.taskId, table.tagId] })]
);
```

- [ ] **Step 2: `packages/db/src/schema/comments.ts`**

```ts
import {
	index,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { task } from "./tasks";

export const taskComment = pgTable(
	"task_comment",
	{
		authorId: text("author_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		body: text("body").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		id: uuid("id").defaultRandom().primaryKey(),
		taskId: uuid("task_id")
			.notNull()
			.references(() => task.id, { onDelete: "cascade" }),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("task_comment_taskId_idx").on(table.taskId)]
);
```

- [ ] **Step 3: `packages/db/src/schema/relations.ts` — mover/extender relations (Ruling 1)**

Criar com `taskRelations` estendido + novas relations:

```ts
import { relations } from "drizzle-orm";

import { user } from "./auth";
import { taskComment } from "./comments";
import { project } from "./projects";
import { task } from "./tasks";
import { tag, taskTag } from "./tags";

export const taskRelations = relations(task, ({ many, one }) => ({
	assignee: one(user, {
		fields: [task.assigneeId],
		references: [user.id],
	}),
	project: one(project, {
		fields: [task.projectId],
		references: [project.id],
	}),
	taskComments: many(taskComment),
	taskTags: many(taskTag),
}));

export const taskTagRelations = relations(taskTag, ({ one }) => ({
	tag: one(tag, { fields: [taskTag.tagId], references: [tag.id] }),
	task: one(task, { fields: [taskTag.taskId], references: [task.id] }),
}));

export const tagRelations = relations(tag, ({ many }) => ({
	taskTags: many(taskTag),
}));

export const taskCommentRelations = relations(taskComment, ({ one }) => ({
	author: one(user, {
		fields: [taskComment.authorId],
		references: [user.id],
	}),
	task: one(task, { fields: [taskComment.taskId], references: [task.id] }),
}));
```

Remover `taskRelations` de `tasks.ts` (e import `relations`/`user`/`project` se ficarem órfãos — manter imports usados pela tabela).

- [ ] **Step 4: `schema/index.ts`**

```ts
export * from "./auth";
export * from "./comments";
export * from "./invitations";
export * from "./projects";
export * from "./relations";
export * from "./tags";
export * from "./tasks";
```

**Interfaces:**
- Produces: `import { tag, taskTag, taskComment } from "@TaskNest/db"`.

- [ ] **Step 5: Gerar migration + aplicar**

Run: `bun run db:generate` (sem args extras) → migração com `tag`, `task_tag`, `task_comment`.
Run: `bun run db:push` → aplica no Postgres local (docker-compose já sobe o banco; se recusado, subir com `docker compose up -d` do serviço postgres).
Verify: `bun x drizzle-kit` studio não é necessário; checar via `psql`/query rápida que as 3 tabelas existem.

- [ ] **Step 6: Check + Commit**

Run: `bun run check-types` → PASS.

```bash
git add packages/db/src/schema/
git commit -m "feat(db): user tags and task comments schema"
```

### Task 4: API routers tags/comments + tasks filtro

**Files:**
- Create: `packages/api/src/routers/tags.ts`
- Create: `packages/api/src/routers/comments.ts`
- Modify: `packages/api/src/routers/index.ts`
- Modify: `packages/api/src/routers/tasks.ts`

**Interfaces:**
- Consumes: `protectedProcedure`, helper `requireMember` (tasks.ts; em novos routers duplicar helper local ou exportar de um módulo compartilhado `packages/api/src/utils.ts` — seguir padrão existente do repo, sem sobre-engenharia).
- Produces (tipos exatos):
  - `tags.list()` → `{ id, name, color }[]` (tags do usuário da sessão, ordenadas por name)
  - `tags.create({ name: string(1..30), color?: "#rrggbb" })` → tag criada (idempotente: se já existir tag com mesmo `userId+name`, retorna existente)
  - `tags.update({ tagId: uuid, name?: string, color?: string })` → tag
  - `tags.delete({ tagId: uuid })` → `{ success: true }` (só se `tag.userId === session.user.id`)
  - `tags.setTags({ taskId: uuid, tagIds: uuid[] })` → task achatada com `tags` (valida: task existe, usuário é membro do projeto, todos os `tagIds` pertencem ao usuário)
  - `comments.list({ taskId })` → `{ id, body, createdAt, updatedAt, author: {id,name,image}, canEdit: boolean }[]` asc por createdAt; `canEdit = autor || papel owner/admin`
  - `comments.create({ taskId, body: string(1..2000) })` → comment com author
  - `comments.update({ commentId, body })` / `comments.delete({ commentId })` → autor ou owner/admin, senão `FORBIDDEN`
  - `tasks.list({ projectId, tagIds?: uuid[] })` → tasks com `tags: { id, name, color }[]` achatadas (Ruling 2) e `with assignee`; `tasks.get` idem.

- [ ] **Step 1: `tags.ts`** com os 5 procedures acima; `with: undefined` — usar `db.query.tag.findMany({ where: and(eq(tag.userId, session.user.id)), orderBy: asc(tag.name) })` (asc do `drizzle-orm`).

- [ ] **Step 2: `comments.ts`** — resolver task → `requireMember`; para update/delete buscar `projectMember` do usuário e liberar `owner|admin`.

- [ ] **Step 3: Registrar** em `packages/api/src/routers/index.ts`: `tags: tagsRouter`, `comments: commentsRouter`.

- [ ] **Step 4: `tasks.ts`** — `list`: input `z.object({ projectId: z.string().uuid(), tagIds: z.array(z.string().uuid()).optional() })`; buscar com `with: { assignee: {...}, taskTags: { with: { tag: true } } }`; se `tagIds?.length`, filtrar `where: and(eq(task.projectId, input.projectId), inArray(taskTag.tagId, input.tagIds))` via join ou subquery `inArray(task.id, db.select({id: taskTag.taskId}).from(taskTag).where(inArray(taskTag.tagId, input.tagIds)))`; mapear para achatar `tags`. `get` idem sem filtro. `create` aceita `tagIds?: uuid[]` opcional (insere `taskTag` no mesmo fluxo). Excluir taskTag manualmente não é preciso (cascade), mas `tags.delete` de tag usada limpa via FK cascade.

- [ ] **Step 5: Regenerar client tipado + Check**

Run: `bun x tsc -b packages/api` e `bun run check-types` → PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/api/src/
git commit -m "feat(api): tags and comments routers with task filter"
```

### Task 5: UI Tags — badge, filtro no header, atribuição no modal

**Files:**
- Create: `apps/web/src/components/tags/tag-badge.tsx`
- Modify: `apps/web/src/components/dashboard/project-header.tsx`
- Modify: `apps/web/src/routes/_auth/dashboard.$projectId.tsx`
- Modify: `apps/web/src/components/dashboard/task-detail-modal.tsx`
- Modify: `apps/web/src/components/dashboard/task-card.tsx`
- Modify: `apps/web/src/components/dashboard/task-list-view.tsx` (coluna/badges, se existir render de task)

**Interfaces:**
- Consumes: `orpc.tags.list/create/setTags`, shape `task.tags: {id,name,color}[]`.
- Produces: `TagBadge({ name, color })`; `ProjectHeader` props extras `allTags: {id,name,color}[]`, `selectedTagIds: string[]`, `onTagToggle(tagId): void`; página mantém `selectedTagIds` e filtra client-side (Ruling 4): `selectedTagIds.every(id => t.tags.some(tg => tg.id === id))`.

- [ ] **Step 1: `tag-badge.tsx`**

```tsx
export function TagBadge({ color, name }: { color: string; name: string }) {
	return (
		<span
			className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
			style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40`, color }}
		>
			{name}
		</span>
	);
}
```

- [ ] **Step 2: Página** `dashboard.$projectId.tsx`: `useQuery(orpc.tags.list.queryOptions())`; state `selectedTagIds`; passar props ao `ProjectHeader`; estender `filteredTasks` com filtro de tags (Ruling 4).
- [ ] **Step 3: `ProjectHeader`**: linha extra na Filter Bar com `allTags.map` → botão-chip (`aria-pressed` por seleção, `TagBadge` dentro). Ignorar filtro quando `allTags` vazio.
- [ ] **Step 4: `task-detail-modal.tsx`**: seção "Tags" — chips das tags da task (remover) + `<Select multiple>`-style: popover/combobox com `tags.list` e opção inline "+ Create tag" (input nome → `tags.create`); mudança chama `orpc.tags.setTags.mutationOptions` com array completo; invalidar `tasks.list` e `tags.list`.
- [ ] **Step 5: `task-card.tsx` e list view**: render `task.tags?.slice(0,3)` com `TagBadge` + "+N" overflow.
- [ ] **Step 6: `task-create-modal.tsx`**: multi-select de tags igual ao detail; enviar `tagIds` em `createTask`.
- [ ] **Step 7: Check + Commit**

Run: `bun run check-types` → PASS.

```bash
git add apps/web/src/components/tags/ apps/web/src/components/dashboard/ "apps/web/src/routes/_auth/dashboard.\$projectId.tsx"
git commit -m "feat(web): user tags filter and assign"
```

### Task 6: UI Comments thread completa

**Files:**
- Create: `apps/web/src/components/comments/comment-thread.tsx`
- Modify: `apps/web/src/components/dashboard/task-detail-modal.tsx`

**Interfaces:**
- Consumes: `orpc.comments.list/create/update/delete`, `authClient.useSession()`, shape de Task 4 (`canEdit`).
- Produces: `CommentThread({ taskId }: { taskId: string })`.

- [ ] **Step 1: `comment-thread.tsx`** — `useQuery(comments.list)`, textarea + botão "Comment" (`comments.create`), lista asc: Avatar (author.image/fallback inicial), nome, data (`toLocaleString`), corpo; item do autor ou `canEdit`: botões Edit (inline textarea + Save) e Delete (ícone `Trash2`, `comments.delete`), invalidar `comments.list.queryKey({input:{taskId}})`.

- [ ] **Step 2: Embutir** em `TaskDetailModal` após bloco assignee, antes do footer de Delete/Close: `<CommentThread taskId={task.id} />`.

- [ ] **Step 3: Check + Commit**

Run: `bun run check-types` → PASS.

```bash
git add apps/web/src/components/comments/ apps/web/src/components/dashboard/task-detail-modal.tsx
git commit -m "feat(web): task comment thread with edit delete"
```

### Task 7: Separar Settings conta vs projeto

**Files:**
- Create: `apps/web/src/routes/_auth/dashboard.$projectId.settings.tsx` (conteúdo movido de `settings.$projectId.tsx`, rota `/_auth/dashboard/$projectId/settings`)
- Delete: `apps/web/src/routes/_auth/settings.$projectId.tsx`
- Modify: `apps/web/src/routes/_auth/settings.tsx` (adicionar subtítulo explícito "Account")
- Modify: `apps/web/src/components/dashboard/project-header.tsx:121` (`to="/dashboard/$projectId/settings"`)
- Modify: `apps/web/src/components/dashboard/sidebar.tsx` (label "Account Settings"; ao estar em projeto, link "Project Settings" contextual)

**Interfaces:**
- Consumes: roteador TanStack file-based; `routeTree.gen.ts` regenera ao rodar `bun run check-types` (build do vite com plugin) ou dev server.
- Produces: `/settings` = conta; `/dashboard/$projectId/settings` = projeto.

- [ ] **Step 1:** Criar novo arquivo de rota movendo o componente `ProjectSettingsPage` atual, com `createFileRoute("/_auth/dashboard/$projectId/settings")`.
- [ ] **Step 2:** Deletar `settings.$projectId.tsx`; atualizar os links (header/link Settings do board; sidebar).
- [ ] **Step 3:** Sidebar: `useMatchRoute`/pathname para detectar `/dashboard/$projectId/*` e renderizar link "Project Settings" para `/dashboard/$projectId/settings` (usar `useRouterState` para ler pathname atual).
- [ ] **Step 4: Check** — `bun run check-types` → PASS (confirma `routeTree.gen.ts` consistente). QA manual: `/settings` só perfil; board Settings → settings do projeto.
- [ ] **Step 5: Commit**

```bash
git add apps/web/src/routes/ apps/web/src/components/dashboard/ apps/web/src/routeTree.gen.ts
git commit -m "fix(web): split account vs project settings routes"
```

### Task 8: Verificação final

- [ ] **Step 1:** `bun run fix && bun run check && bun run check-types` → 0 erros.
- [ ] **Step 2: QA manual checklist**
Header centrado desktop/mobile; logado vê "Go to Dashboard" no header/hero/CTA e não "Try Demo"; `/login` logado redirect; dropdown tem Dashboard/Settings; tags criar/atribuir/filtrar com 2+ tags; comments criar/editar/excluir (autor e admin; member sem botões em alheios); `/settings` vs settings de projeto isolados; Kanban drag & drop intacto.
- [ ] **Step 3: Commit residual se necessário** (`git add -A && git commit -m "chore: final verification fixes"`).
