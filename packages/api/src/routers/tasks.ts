import type { Database } from "@TaskNest/db";
import { projectMember, tag, task, taskTag } from "@TaskNest/db";
import { ORPCError } from "@orpc/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure } from "../index";

export async function requireMember(
	db: Database,
	userId: string,
	projectId: string
) {
	const membership = await db.query.projectMember.findFirst({
		where: and(
			eq(projectMember.projectId, projectId),
			eq(projectMember.userId, userId)
		),
	});
	if (!membership) {
		throw new ORPCError("FORBIDDEN");
	}
	return membership;
}

/**
 * Validates every tagId belongs to the user (dedup), returning the unique
 * list. Throws FORBIDDEN on unknown/foreign tag ids. No-op for empty input.
 */
export async function assertOwnedTagIds(
	db: Database,
	userId: string,
	tagIds: string[]
) {
	if (tagIds.length === 0) {
		return [];
	}
	const unique = [...new Set(tagIds)];
	const owned = await db.query.tag.findMany({
		columns: { id: true },
		where: and(eq(tag.userId, userId), inArray(tag.id, unique)),
	});
	if (owned.length !== unique.length) {
		throw new ORPCError("FORBIDDEN");
	}
	return unique;
}

/**
 * Rejects assigneeIds outside the project. Null/undefined clears or skips
 * assignment. Unknown users have no membership row, so they fail closed
 * with FORBIDDEN instead of a FK 500 that enumerates IDs.
 */
export async function assertAssigneeInProject(
	db: Database,
	assigneeId: string | null | undefined,
	projectId: string
) {
	if (!assigneeId) {
		return;
	}
	await requireMember(db, assigneeId, projectId);
}

export interface FlatTag {
	color: string;
	id: string;
	name: string;
}

function flattenTask<T extends { taskTags: { tag?: FlatTag }[] }>(row: T) {
	const { taskTags, ...rest } = row;
	return {
		...rest,
		tags: taskTags.flatMap((taskTagRow) =>
			taskTagRow.tag ? [taskTagRow.tag] : []
		),
	};
}

/** Task row with assignee + flattened `tags` (Ruling 2: no `taskTags`). */
export async function getTaskWithTags(db: Database, taskId: string) {
	const found = await db.query.task.findFirst({
		where: eq(task.id, taskId),
		with: {
			assignee: {
				columns: { email: true, id: true, image: true, name: true },
			},
			taskTags: {
				with: { tag: { columns: { color: true, id: true, name: true } } },
			},
		},
	});
	if (!found) {
		return null;
	}
	return flattenTask(found);
}

export const tasksRouter = {
	create: protectedProcedure
		.input(
			z.object({
				assigneeId: z.string().optional(),
				description: z.string().max(2000).optional(),
				dueDate: z.string().datetime().optional(),
				priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
				projectId: z.string().uuid(),
				tagIds: z.array(z.string().uuid()).optional(),
				title: z.string().min(1).max(200),
			})
		)
		.handler(async ({ context, input }) => {
			const userId = context.session.user.id;
			await requireMember(context.db, userId, input.projectId);
			await assertAssigneeInProject(
				context.db,
				input.assigneeId,
				input.projectId
			);
			const tagIds = await assertOwnedTagIds(
				context.db,
				userId,
				input.tagIds ?? []
			);

			// Task row + tag attachments commit atomically.
			const newTask = await context.db.transaction(async (tx) => {
				const [inserted] = await tx
					.insert(task)
					.values({
						assigneeId: input.assigneeId,
						description: input.description,
						dueDate: input.dueDate ? new Date(input.dueDate) : null,
						priority: input.priority ?? "medium",
						projectId: input.projectId,
						title: input.title,
					})
					.returning();

				if (!inserted) {
					throw new ORPCError("INTERNAL_SERVER_ERROR");
				}

				if (tagIds.length > 0) {
					await tx
						.insert(taskTag)
						.values(tagIds.map((tagId) => ({ tagId, taskId: inserted.id })));
				}

				return inserted;
			});

			const created = await getTaskWithTags(context.db, newTask.id);
			if (!created) {
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}
			return created;
		}),

	delete: protectedProcedure
		.input(z.object({ taskId: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			const found = await context.db.query.task.findFirst({
				where: eq(task.id, input.taskId),
			});
			if (!found) {
				throw new ORPCError("NOT_FOUND");
			}

			const membership = await requireMember(
				context.db,
				context.session.user.id,
				found.projectId
			);
			if (membership.role === "member") {
				throw new ORPCError("FORBIDDEN");
			}

			await context.db.delete(task).where(eq(task.id, input.taskId));
			return { success: true };
		}),

	get: protectedProcedure
		.input(z.object({ taskId: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			const found = await getTaskWithTags(context.db, input.taskId);
			if (!found) {
				throw new ORPCError("NOT_FOUND");
			}
			await requireMember(context.db, context.session.user.id, found.projectId);
			return found;
		}),
	list: protectedProcedure
		.input(
			z.object({
				limit: z.number().int().min(1).max(100).default(50),
				offset: z.number().int().min(0).default(0),
				projectId: z.string().uuid(),
				tagIds: z.array(z.string().uuid()).optional(),
			})
		)
		.handler(async ({ context, input }) => {
			await requireMember(context.db, context.session.user.id, input.projectId);
			const tasks = await context.db.query.task.findMany({
				limit: input.limit,
				offset: input.offset,
				orderBy: [desc(task.createdAt)],
				where: and(
					eq(task.projectId, input.projectId),
					input.tagIds?.length
						? inArray(
								task.id,
								context.db
									.select({ id: taskTag.taskId })
									.from(taskTag)
									.where(inArray(taskTag.tagId, input.tagIds))
							)
						: undefined
				),
				with: {
					assignee: {
						columns: { email: true, id: true, image: true, name: true },
					},
					taskTags: {
						with: { tag: { columns: { color: true, id: true, name: true } } },
					},
				},
			});
			return tasks.map(flattenTask);
		}),

	update: protectedProcedure
		.input(
			z.object({
				assigneeId: z.string().nullable().optional(),
				description: z.string().max(2000).optional(),
				dueDate: z.string().datetime().nullable().optional(),
				priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
				taskId: z.string().uuid(),
				title: z.string().min(1).max(200).optional(),
			})
		)
		.handler(async ({ context, input }) => {
			const found = await context.db.query.task.findFirst({
				where: eq(task.id, input.taskId),
			});
			if (!found) {
				throw new ORPCError("NOT_FOUND");
			}

			const membership = await requireMember(
				context.db,
				context.session.user.id,
				found.projectId
			);
			const isOwnTask = found.assigneeId === context.session.user.id;
			if (membership.role === "member" && !isOwnTask) {
				throw new ORPCError("FORBIDDEN");
			}
			if (input.assigneeId !== undefined) {
				await assertAssigneeInProject(
					context.db,
					input.assigneeId,
					found.projectId
				);
			}

			await context.db
				.update(task)
				.set({
					...(input.title !== undefined && { title: input.title }),
					...(input.description !== undefined && {
						description: input.description,
					}),
					...(input.priority !== undefined && { priority: input.priority }),
					...(input.assigneeId !== undefined && {
						assigneeId: input.assigneeId,
					}),
					...(input.dueDate !== undefined && {
						dueDate: input.dueDate ? new Date(input.dueDate) : null,
					}),
				})
				.where(eq(task.id, input.taskId));

			// Unified flattened contract (same shape as list/get/create).
			const updated = await getTaskWithTags(context.db, input.taskId);
			if (!updated) {
				throw new ORPCError("NOT_FOUND");
			}
			return updated;
		}),

	updateStatus: protectedProcedure
		.input(
			z.object({
				status: z.enum(["todo", "in_progress", "done"]),
				taskId: z.string().uuid(),
			})
		)
		.handler(async ({ context, input }) => {
			const found = await context.db.query.task.findFirst({
				where: eq(task.id, input.taskId),
			});
			if (!found) {
				throw new ORPCError("NOT_FOUND");
			}

			await requireMember(context.db, context.session.user.id, found.projectId);

			await context.db
				.update(task)
				.set({ status: input.status })
				.where(eq(task.id, input.taskId));

			// Unified flattened contract (same shape as list/get/create).
			const updated = await getTaskWithTags(context.db, input.taskId);
			if (!updated) {
				throw new ORPCError("NOT_FOUND");
			}
			return updated;
		}),
};
