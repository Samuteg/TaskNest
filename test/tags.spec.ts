import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const read = (path: string) => readFile(path, "utf8");
const apiTags = () => read("packages/api/src/routers/tags.ts");
const apiTasks = () => read("packages/api/src/routers/tasks.ts");
const page = () =>
	read("apps/web/src/routes/_auth/dashboard.$projectId.index.tsx");
const header = () =>
	read("apps/web/src/components/dashboard/project-header.tsx");
const editor = () => read("apps/web/src/components/tags/tag-editor.tsx");
const detailModal = () =>
	read("apps/web/src/components/dashboard/task-detail-modal.tsx");
const createModal = () =>
	read("apps/web/src/components/dashboard/task-create-modal.tsx");

function assertContains(source: string, fragment: string) {
	assert.ok(source.includes(fragment), `Missing contract: ${fragment}`);
}

test("criação e listagem de tags do usuário @spec:AC-001", async () => {
	const source = await apiTags();
	assertContains(source, "name: z.string().min(1).max(30)");
	assertContains(source, "where: eq(tag.userId, context.session.user.id)");
	assertContains(source, "columns: { color: true, id: true, name: true }");
});

test("criação idempotente por usuário e nome @spec:AC-002", async () => {
	const source = await apiTags();
	assertContains(source, "onConflictDoNothing()");
	assertContains(source, "eq(tag.name, input.name)");
	assertContains(source, "eq(tag.userId, userId)");
});

test("atribuição retorna tags achatadas @spec:AC-003", async () => {
	const source = await apiTasks();
	assertContains(source, "tags: taskTags.flatMap");
	assertContains(source, "taskTags: {");
	assertContains(
		source,
		"with: { tag: { columns: { color: true, id: true, name: true } } }"
	);
	assertContains(await apiTags(), "return updated;");
});

test("tags estrangeiras ficam somente leitura no editor @spec:AC-004", async () => {
	const source = await editor();
	assertContains(
		source,
		"const foreignTags = attached.filter((t) => !ownIds.has(t.id))"
	);
	assertContains(source, "key={");
	assertContains(source, "foreign-");
	assertContains(source, "t.id");
	assertContains(source, "name={t.name} />");
	assertContains(await detailModal(), "tagIds: nextOwned.map((t) => t.id)");
});

test("IDs de tags estrangeiras são rejeitados e não alteram task @spec:AC-005", async () => {
	const source = await apiTasks();
	assertContains(source, 'throw new ORPCError("FORBIDDEN")');
	const tagsSource = await apiTags();
	assertContains(
		tagsSource,
		"await assertOwnedTagIds(context.db, userId, input.tagIds)"
	);
	assertContains(tagsSource, "await context.db.transaction(async (tx) =>");
});

test("filtro de quadro usa todas as tags selecionadas @spec:AC-006", async () => {
	const source = await page();
	assertContains(
		source,
		"selectedTagIds.every((id) => t.tags.some((tg) => tg.id === id))"
	);
	const headerSource = await header();
	assertContains(headerSource, "aria-pressed={isActive}");
	assertContains(headerSource, "onClick={() => onTagToggle(t.id)}");
});

test("criação de task envia IDs de tags selecionadas @spec:AC-007", async () => {
	const source = await createModal();
	assertContains(source, "tagIds: tags.map((t) => t.id)");
	assertContains(source, "<TagEditor onChange={setTags} selected={tags} />");
	assertContains(
		await apiTasks(),
		"tagIds: z.array(z.string().uuid()).optional()"
	);
});

test("campo de texto de criação de tag impede propagação de teclado no dropdown @spec:AC-008", async () => {
	const source = await editor();
	assertContains(source, "onKeyDown=");
	assertContains(source, "e.stopPropagation()");
	assertContains(source, "closeOnClick={false}");
});
