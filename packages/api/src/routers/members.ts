import type { Database } from "@TaskNest/db";
import { projectMember } from "@TaskNest/db";
import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
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

export const membersRouter = {
	list: protectedProcedure
		.input(z.object({ projectId: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			await requireMember(context.db, context.session.user.id, input.projectId);
			return context.db.query.projectMember.findMany({
				where: eq(projectMember.projectId, input.projectId),
				with: {
					user: {
						columns: { email: true, id: true, image: true, name: true },
					},
				},
			});
		}),

	remove: protectedProcedure
		.input(z.object({ projectId: z.string().uuid(), userId: z.string() }))
		.handler(async ({ context, input }) => {
			const callerMembership = await requireMember(
				context.db,
				context.session.user.id,
				input.projectId
			);
			if (
				callerMembership.role !== "owner" &&
				callerMembership.role !== "admin"
			) {
				throw new ORPCError("FORBIDDEN");
			}

			const targetMembership = await context.db.query.projectMember.findFirst({
				where: and(
					eq(projectMember.projectId, input.projectId),
					eq(projectMember.userId, input.userId)
				),
			});
			if (targetMembership?.role === "owner") {
				throw new ORPCError("FORBIDDEN");
			}

			await context.db
				.delete(projectMember)
				.where(
					and(
						eq(projectMember.projectId, input.projectId),
						eq(projectMember.userId, input.userId)
					)
				);
			return { success: true };
		}),

	updateRole: protectedProcedure
		.input(
			z.object({
				projectId: z.string().uuid(),
				role: z.enum(["admin", "member"]),
				userId: z.string(),
			})
		)
		.handler(async ({ context, input }) => {
			const callerMembership = await requireMember(
				context.db,
				context.session.user.id,
				input.projectId
			);
			if (callerMembership.role !== "owner") {
				throw new ORPCError("FORBIDDEN");
			}

			const [updated] = await context.db
				.update(projectMember)
				.set({ role: input.role })
				.where(
					and(
						eq(projectMember.projectId, input.projectId),
						eq(projectMember.userId, input.userId)
					)
				)
				.returning();

			if (!updated) {
				throw new ORPCError("NOT_FOUND");
			}

			return updated;
		}),
};
