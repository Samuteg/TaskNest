import { project, projectMember, task } from "@TaskNest/db";
import { ORPCError } from "@orpc/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure } from "../index";

export const projectsRouter = {
	create: protectedProcedure
		.input(
			z.object({
				description: z.string().max(500).optional(),
				name: z.string().min(1).max(100),
			})
		)
		.handler(async ({ context, input }) => {
			const userId = context.session.user.id;
			const [newProject] = await context.db
				.insert(project)
				.values({
					description: input.description,
					name: input.name,
					ownerId: userId,
				})
				.returning();

			if (!newProject) {
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}

			await context.db.insert(projectMember).values({
				projectId: newProject.id,
				role: "owner",
				userId,
			});

			return newProject;
		}),

	delete: protectedProcedure
		.input(z.object({ projectId: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			const userId = context.session.user.id;
			const membership = await context.db.query.projectMember.findFirst({
				where: and(
					eq(projectMember.projectId, input.projectId),
					eq(projectMember.userId, userId)
				),
			});
			if (membership?.role !== "owner") {
				throw new ORPCError("FORBIDDEN");
			}

			await context.db.delete(project).where(eq(project.id, input.projectId));
			return { success: true };
		}),

	get: protectedProcedure
		.input(z.object({ projectId: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			const userId = context.session.user.id;
			const membership = await context.db.query.projectMember.findFirst({
				where: and(
					eq(projectMember.projectId, input.projectId),
					eq(projectMember.userId, userId)
				),
				with: {
					project: true,
				},
			});
			if (!membership) {
				throw new ORPCError("NOT_FOUND");
			}
			return membership.project;
		}),

	list: protectedProcedure.handler(async ({ context }) => {
		const userId = context.session.user.id;

		const statsSubquery = context.db
			.select({
				doneCount:
					sql<number>`count(*) filter (where ${task.status} = 'done')`.as(
						"done_count"
					),
				inProgressCount:
					sql<number>`count(*) filter (where ${task.status} = 'in_progress')`.as(
						"in_progress_count"
					),
				projectId: task.projectId,
				taskCount: sql<number>`count(*)`.as("task_count"),
				todoCount:
					sql<number>`count(*) filter (where ${task.status} = 'todo')`.as(
						"todo_count"
					),
			})
			.from(task)
			.groupBy(task.projectId)
			.as("task_stats");

		const memberships = await context.db.query.projectMember.findMany({
			where: eq(projectMember.userId, userId),
			with: {
				project: {
					columns: {
						createdAt: true,
						description: true,
						id: true,
						name: true,
						ownerId: true,
						updatedAt: true,
					},
				},
			},
		});

		const projectIds = memberships.map((m) => m.project.id);
		if (projectIds.length === 0) {
			return [];
		}

		const stats = await context.db
			.select()
			.from(statsSubquery)
			.where(sql`${statsSubquery.projectId} in ${projectIds}`);

		const statsMap = new Map(stats.map((s) => [s.projectId, s]));

		return memberships.map((m) => {
			const s = statsMap.get(m.project.id);
			return {
				...m.project,
				doneCount: s?.doneCount ?? 0,
				inProgressCount: s?.inProgressCount ?? 0,
				taskCount: s?.taskCount ?? 0,
				todoCount: s?.todoCount ?? 0,
			};
		});
	}),

	update: protectedProcedure
		.input(
			z.object({
				description: z.string().max(500).optional(),
				name: z.string().min(1).max(100).optional(),
				projectId: z.string().uuid(),
			})
		)
		.handler(async ({ context, input }) => {
			const userId = context.session.user.id;
			const membership = await context.db.query.projectMember.findFirst({
				where: and(
					eq(projectMember.projectId, input.projectId),
					eq(projectMember.userId, userId)
				),
			});
			if (!membership || membership.role === "member") {
				throw new ORPCError("FORBIDDEN");
			}

			const [updated] = await context.db
				.update(project)
				.set({
					...(input.name !== undefined && { name: input.name }),
					...(input.description !== undefined && {
						description: input.description,
					}),
				})
				.where(eq(project.id, input.projectId))
				.returning();

			if (!updated) {
				throw new ORPCError("NOT_FOUND");
			}

			return updated;
		}),
};
