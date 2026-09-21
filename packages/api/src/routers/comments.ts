import type { Database } from "@TaskNest/db";
import { task, taskComment } from "@TaskNest/db";
import { ORPCError } from "@orpc/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure } from "../index";
import { requireMember } from "./tasks";

type CommentWithAuthor = {
	author: { id: string; image: string | null; name: string };
	authorId: string;
	body: string;
	createdAt: Date;
	id: string;
	updatedAt: Date;
};

const getCommentWithAuthor = async (db: Database, commentId: string) =>
	db.query.taskComment.findFirst({
		where: eq(taskComment.id, commentId),
		with: { author: { columns: { id: true, image: true, name: true } } },
	});

/** Resolves task -> project membership; throws NOT_FOUND / FORBIDDEN. */
async function requireTaskMembership(
	db: Database,
	userId: string,
	taskId: string
) {
	const foundTask = await db.query.task.findFirst({
		where: eq(task.id, taskId),
	});
	if (!foundTask) {
		throw new ORPCError("NOT_FOUND");
	}
	return requireMember(db, userId, foundTask.projectId);
}

function toCommentItem(
	row: CommentWithAuthor,
	canModerate: boolean,
	userId: string
) {
	return {
		author: {
			id: row.author.id,
			image: row.author.image,
			name: row.author.name,
		},
		body: row.body,
		canEdit: canModerate || row.authorId === userId,
		createdAt: row.createdAt,
		id: row.id,
		updatedAt: row.updatedAt,
	};
}

export const commentsRouter = {
	create: protectedProcedure
		.input(
			z.object({
				body: z.string().min(1).max(2000),
				taskId: z.string().uuid(),
			})
		)
		.handler(async ({ context, input }) => {
			const userId = context.session.user.id;
			const membership = await requireTaskMembership(
				context.db,
				userId,
				input.taskId
			);

			const [inserted] = await context.db
				.insert(taskComment)
				.values({ authorId: userId, body: input.body, taskId: input.taskId })
				.returning();
			if (!inserted) {
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}

			const full = await getCommentWithAuthor(context.db, inserted.id);
			if (!full) {
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}
			return toCommentItem(
				full,
				membership.role === "admin" || membership.role === "owner",
				userId
			);
		}),

	delete: protectedProcedure
		.input(z.object({ commentId: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			const userId = context.session.user.id;
			const found = await context.db.query.taskComment.findFirst({
				where: eq(taskComment.id, input.commentId),
			});
			if (!found) {
				throw new ORPCError("NOT_FOUND");
			}

			const membership = await requireTaskMembership(
				context.db,
				userId,
				found.taskId
			);
			const isModerator =
				membership.role === "admin" || membership.role === "owner";
			if (found.authorId !== userId && !isModerator) {
				throw new ORPCError("FORBIDDEN");
			}

			await context.db
				.delete(taskComment)
				.where(eq(taskComment.id, input.commentId));
			return { success: true };
		}),

	list: protectedProcedure
		.input(z.object({ taskId: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			const userId = context.session.user.id;
			const membership = await requireTaskMembership(
				context.db,
				userId,
				input.taskId
			);
			const isModerator =
				membership.role === "admin" || membership.role === "owner";

			const comments = await context.db.query.taskComment.findMany({
				orderBy: [asc(taskComment.createdAt), asc(taskComment.id)],
				where: eq(taskComment.taskId, input.taskId),
				with: { author: { columns: { id: true, image: true, name: true } } },
			});
			return comments.map((comment) =>
				toCommentItem(comment, isModerator, userId)
			);
		}),

	update: protectedProcedure
		.input(
			z.object({
				body: z.string().min(1).max(2000),
				commentId: z.string().uuid(),
			})
		)
		.handler(async ({ context, input }) => {
			const userId = context.session.user.id;
			const found = await context.db.query.taskComment.findFirst({
				where: eq(taskComment.id, input.commentId),
			});
			if (!found) {
				throw new ORPCError("NOT_FOUND");
			}

			const membership = await requireTaskMembership(
				context.db,
				userId,
				found.taskId
			);
			const isModerator =
				membership.role === "admin" || membership.role === "owner";
			if (found.authorId !== userId && !isModerator) {
				throw new ORPCError("FORBIDDEN");
			}

			const [updated] = await context.db
				.update(taskComment)
				.set({ body: input.body })
				.where(eq(taskComment.id, input.commentId))
				.returning();
			if (!updated) {
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}

			const full = await getCommentWithAuthor(context.db, updated.id);
			if (!full) {
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}
			return toCommentItem(full, isModerator, userId);
		}),
};
