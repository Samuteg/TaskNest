import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const read = (path: string) => readFile(path, "utf8");

function assertContains(source: string, fragment: string) {
	assert.ok(source.includes(fragment), `Missing contract: ${fragment}`);
}

test("C-01: accept checa inv.email e usa transação idempotente @auditoria", async () => {
	const source = await read("packages/api/src/routers/invitations.ts");
	assertContains(source, "inv.email.toLowerCase()");
	assertContains(source, ".transaction(async (tx)");
	assertContains(source, "onConflictDoNothing()");
});

test("A-01: profile.update só aceita name @auditoria", async () => {
	const source = await read("packages/api/src/routers/profile.ts");
	assert.ok(!source.includes("input.email"), "profile ainda aceita email");
	assertContains(source, "input.name");
	const form = await read("apps/web/src/components/settings/profile-form.tsx");
	assert.ok(!form.includes("setEmail"), "form ainda edita email");
});

test("A-02: helmet + rate-limit + senha 12 + verificação de email @auditoria", async () => {
	const server = await read("apps/server/src/index.ts");
	assertContains(server, "fastifyHelmet");
	assertContains(server, "fastifyRateLimit");
	assertContains(server, "rateLimit: { max: 20");
	const auth = await read("packages/auth/src/index.ts");
	assertContains(auth, "minPasswordLength: 12");
	assertContains(auth, "requireEmailVerification: true");
	assertContains(auth, "sendOnSignUp: true");
	const signup = await read("apps/web/src/components/sign-up-form.tsx");
	assertContains(signup, ".min(12,");
	assertContains(signup, 'callbackURL: "/login?verified=1"');
	assert.ok(
		!signup.includes('to: "/dashboard"'),
		"signup ainda navega direto sem verificar email"
	);
});

test("A-03: paginação tasks/comments com teto 100 + índice @auditoria", async () => {
	const tasks = await read("packages/api/src/routers/tasks.ts");
	assertContains(tasks, "limit: z.number().int().min(1).max(100).default(50)");
	assertContains(tasks, "offset: z.number().int().min(0).default(0)");
	assertContains(tasks, "limit: input.limit");
	const comments = await read("packages/api/src/routers/comments.ts");
	assertContains(comments, "max(100).default(50)");
	const schema = await read("packages/db/src/schema/tasks.ts");
	assertContains(schema, "task_projectId_createdAt_idx");
	const projects = await read("packages/api/src/routers/projects.ts");
	assertContains(projects, "limit: 100,");
	const tags = await read("packages/api/src/routers/tags.ts");
	assertContains(tags, "limit: 100,");
});

test("M-01: assigneeId validado contra members do projeto @auditoria", async () => {
	const source = await read("packages/api/src/routers/tasks.ts");
	assertContains(source, "assertAssigneeInProject");
	assertContains(source, "await requireMember(db, assigneeId, projectId)");
});

test("M-02: stats filtra com inArray antes de agrupar @auditoria", async () => {
	const source = await read("packages/api/src/routers/projects.ts");
	assertContains(source, "inArray(task.projectId, projectIds)");
	assertContains(source, ".where(inArray(task.projectId, projectIds))");
	assert.ok(
		!source.includes("in $"),
		"interpolacao crua de IDs ainda presente"
	);
});

test("M-03: sem credencial default versionada @auditoria", async () => {
	const compose = await read("docker-compose.yml");
	assert.ok(
		!compose.includes("postgres:postgres@"),
		"DATABASE_URL default ainda versionada"
	);
	assertContains(compose, "POSTGRES_PASSWORD:?");
	const example = await read(".env.example");
	assertContains(example, "POSTGRES_PASSWORD=");
});

test("B-01/B-02: sem stack em stdout + cookie lax @auditoria", async () => {
	const server = await read("apps/server/src/index.ts");
	assert.ok(!server.includes("console.error"), "console.error ainda presente");
	assert.ok(
		!server.includes('{ err: error }, "Authentication Error:"'),
		"detalhe de erro ainda vazado no log"
	);
	const auth = await read("packages/auth/src/index.ts");
	assertContains(auth, 'sameSite: "lax"');
	assert.ok(!auth.includes('sameSite: "none"'), "sameSite none ainda ativo");
});

test("Pendências: XSS/SSRF/nginx @auditoria", async () => {
	const board = await read("apps/web/src/components/dashboard/task-board.tsx");
	assert.ok(!board.includes("dangerouslySetInnerHTML"), "XSS sink no board");
	const thread = await read(
		"apps/web/src/components/comments/comment-thread.tsx"
	);
	assert.ok(
		!thread.includes("dangerouslySetInnerHTML"),
		"XSS sink nos comentários"
	);
	const apiFiles = [
		"packages/api/src/routers/tasks.ts",
		"packages/api/src/routers/comments.ts",
		"packages/api/src/routers/projects.ts",
		"packages/api/src/routers/invitations.ts",
		"packages/api/src/routers/members.ts",
	];
	const sources = await Promise.all(apiFiles.map((file) => read(file)));
	for (const [index, source] of sources.entries()) {
		const file = apiFiles[index];
		assert.ok(!source.includes("fetch("), `SSRF: fetch inesperado em ${file}`);
	}
	const nginx = await read("apps/web/nginx.conf");
	assertContains(nginx, 'X-Frame-Options "SAMEORIGIN"');
	assertContains(nginx, 'X-Content-Type-Options "nosniff"');
	assertContains(nginx, "Content-Security-Policy");
});
