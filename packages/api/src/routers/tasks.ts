import type { Database } from "@TaskNest/db";
import { projectMember, task } from "@TaskNest/db";
import { ORPCError } from "@orpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure } from "../index";

async function requireMember(db: Database, userId: string, projectId: string) {
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

export const tasksRouter = {
	create: protectedProcedure
		.input(
			z.object({
				assigneeId: z.string().optional(),
				description: z.string().max(2000).optional(),
				dueDate: z.string().datetime().optional(),
				priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
				projectId: z.string().uuid(),
				title: z.string().min(1).max(200),
			})
		)
		.handler(async ({ context, input }) => {
			await requireMember(context.db, context.session.user.id, input.projectId);

			const [newTask] = await context.db
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

			if (!newTask) {
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}

			return newTask;
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
			const found = await context.db.query.task.findFirst({
				where: eq(task.id, input.taskId),
				with: {
					assignee: {
						columns: { email: true, id: true, image: true, name: true },
					},
				},
			});
			if (!found) {
				throw new ORPCError("NOT_FOUND");
			}
			await requireMember(context.db, context.session.user.id, found.projectId);
			return found;
		}),
	list: protectedProcedure
		.input(z.object({ projectId: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			await requireMember(context.db, context.session.user.id, input.projectId);
			return context.db.query.task.findMany({
				orderBy: [desc(task.createdAt)],
				where: eq(task.projectId, input.projectId),
				with: {
					assignee: {
						columns: { email: true, id: true, image: true, name: true },
					},
				},
			});
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

			const [updated] = await context.db
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
				.where(eq(task.id, input.taskId))
				.returning();

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

			const [updated] = await context.db
				.update(task)
				.set({ status: input.status })
				.where(eq(task.id, input.taskId))
				.returning();

			if (!updated) {
				throw new ORPCError("NOT_FOUND");
			}

			return updated;
		}),
};
