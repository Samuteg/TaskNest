# Tasks: Tags

> feature: tags

## T-001 — API e persistência de tags [em-andamento]

- Refs: US-001, AC-001, AC-002, AC-003, AC-005
- Arquivos: packages/db/src/schema/tags.ts, packages/db/src/schema/relations.ts, packages/db/src/schema/index.ts, packages/api/src/routers/tags.ts, packages/api/src/routers/tasks.ts, packages/api/src/routers/index.ts
- Notas: Schema normalizado; tags pertencem ao usuário; autorização rejeita IDs estrangeiros; task responses expõem `tags` achatadas.

## T-002 — Editor e criação de tasks com tags [em-andamento]

- Refs: US-001, AC-004, US-003, AC-007
- Arquivos: apps/web/src/components/tags/tag-badge.tsx, apps/web/src/components/tags/tag-editor.tsx, apps/web/src/components/dashboard/task-detail-modal.tsx, apps/web/src/components/dashboard/task-create-modal.tsx
- Notas: Tags estrangeiras somente leitura; seleção enviada contém apenas IDs próprias; criação de task envia tagIds.

## T-003 — Filtro de tags no quadro [em-andamento]

- Refs: US-002, AC-006
- Arquivos: apps/web/src/routes/_auth/dashboard.$projectId.tsx, apps/web/src/components/dashboard/project-header.tsx, apps/web/src/components/dashboard/task-card.tsx, apps/web/src/components/dashboard/task-list-view.tsx
- Notas: Filtro client-side com semântica AND; badges aparecem no board/list.

## T-004 — Provas executáveis dos critérios [em-andamento]

- Refs: AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007
- Arquivos: test/tags.spec.ts
- Notas: Testes anotados com `@spec:AC-xxx`; usam banco local e inspeção de contratos observáveis.
