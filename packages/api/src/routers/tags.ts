import { tag, task, taskTag } from "@TaskNest/db";
import { ORPCError } from "@orpc/server";
import { and, asc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure } from "../index";
import { assertOwnedTagIds, getTaskWithTags, requireMember } from "./tasks";

const tagSelection = { color: tag.color, id: tag.id, name: tag.name };

const colorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color");

export const tagsRouter = {
	create: protectedProcedure
		.input(
			z.object({
				color: colorSchema.optional(),
				name: z.string().min(1).max(30),
			})
		)
		.handler(async ({ context, input }) => {
			const userId = context.session.user.id;
			const [created] = await context.db
				.insert(tag)
				.values({ color: input.color, name: input.name, userId })
				.onConflictDoNothing()
				.returning(tagSelection);

			if (created) {
				return created;
			}

			// Idempotent: same userId+name already exists, return it.
			const [existing] = await context.db.query.tag.findMany({
				columns: { color: true, id: true, name: true },
				limit: 1,
				where: and(eq(tag.name, input.name), eq(tag.userId, userId)),
			});
			if (!existing) {
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}
			return existing;
		}),

	delete: protectedProcedure
		.input(z.object({ tagId: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			const found = await context.db.query.tag.findFirst({
				where: eq(tag.id, input.tagId),
			});
			if (!found) {
				throw new ORPCError("NOT_FOUND");
			}
			if (found.userId !== context.session.user.id) {
				throw new ORPCError("FORBIDDEN");
			}

			// task_tag rows referencing this tag are removed by FK cascade.
			await context.db.delete(tag).where(eq(tag.id, input.tagId));
			return { success: true };
		}),

	list: protectedProcedure.handler(async ({ context }) =>
		context.db.query.tag.findMany({
			columns: { color: true, id: true, name: true },
			orderBy: [asc(tag.name)],
			where: eq(tag.userId, context.session.user.id),
		})
	),

	setTags: protectedProcedure
		.input(
			z.object({
				tagIds: z.array(z.string().uuid()),
				taskId: z.string().uuid(),
			})
		)
		.handler(async ({ context, input }) => {
			const userId = context.session.user.id;
			const found = await context.db.query.task.findFirst({
				where: eq(task.id, input.taskId),
			});
			if (!found) {
				throw new ORPCError("NOT_FOUND");
			}
			await requireMember(context.db, userId, found.projectId);
			const tagIds = await assertOwnedTagIds(context.db, userId, input.tagIds);

			// Scoped replace: only the caller's own attachments are removed, so
			// tags other members attached to the same task are never wiped.
			await context.db.transaction(async (tx) => {
				await tx
					.delete(taskTag)
					.where(
						and(
							eq(taskTag.taskId, input.taskId),
							inArray(
								taskTag.tagId,
								tx
									.select({ id: tag.id })
									.from(tag)
									.where(eq(tag.userId, userId))
							)
						)
					);
				if (tagIds.length > 0) {
					await tx
						.insert(taskTag)
						.values(tagIds.map((tagId) => ({ tagId, taskId: input.taskId })));
				}
			});

			const updated = await getTaskWithTags(context.db, input.taskId);
			if (!updated) {
				throw new ORPCError("NOT_FOUND");
			}
			return updated;
		}),

	update: protectedProcedure
		.input(
			z.object({
				color: colorSchema.optional(),
				name: z.string().min(1).max(30).optional(),
				tagId: z.string().uuid(),
			})
		)
		.handler(async ({ context, input }) => {
			const userId = context.session.user.id;
			const found = await context.db.query.tag.findFirst({
				where: eq(tag.id, input.tagId),
			});
			if (!found) {
				throw new ORPCError("NOT_FOUND");
			}
			if (found.userId !== userId) {
				throw new ORPCError("FORBIDDEN");
			}

			if (input.color === undefined && input.name === undefined) {
				const { color, id, name } = found;
				return { color, id, name };
			}

			const [updated] = await context.db
				.update(tag)
				.set({
					...(input.color !== undefined && { color: input.color }),
					...(input.name !== undefined && { name: input.name }),
				})
				.where(eq(tag.id, input.tagId))
				.returning(tagSelection);
			if (!updated) {
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}
			return updated;
		}),
};
