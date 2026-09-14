import type { Database } from "@TaskNest/db";
import { invitation, projectMember } from "@TaskNest/db";
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

export const invitationsRouter = {
	accept: protectedProcedure
		.input(z.object({ invitationId: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			const inv = await context.db.query.invitation.findFirst({
				where: eq(invitation.id, input.invitationId),
			});
			if (!inv) {
				throw new ORPCError("NOT_FOUND");
			}
			if (inv.status !== "pending") {
				throw new ORPCError("BAD_REQUEST");
			}
			if (new Date() > inv.expiresAt) {
				await context.db
					.update(invitation)
					.set({ status: "expired" })
					.where(eq(invitation.id, input.invitationId));
				throw new ORPCError("BAD_REQUEST");
			}

			await context.db.insert(projectMember).values({
				projectId: inv.projectId,
				role: inv.role as "admin" | "member",
				userId: context.session.user.id,
			});

			await context.db
				.update(invitation)
				.set({ status: "accepted" })
				.where(eq(invitation.id, input.invitationId));

			return { success: true };
		}),

	cancel: protectedProcedure
		.input(z.object({ invitationId: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			const inv = await context.db.query.invitation.findFirst({
				where: eq(invitation.id, input.invitationId),
			});
			if (!inv) {
				throw new ORPCError("NOT_FOUND");
			}

			const isInvoker = inv.invitedBy === context.session.user.id;
			if (isInvoker) {
				await context.db
					.update(invitation)
					.set({ status: "expired" })
					.where(eq(invitation.id, input.invitationId));
				return { success: true };
			}

			const ownerMembership = await context.db.query.projectMember.findFirst({
				where: and(
					eq(projectMember.projectId, inv.projectId),
					eq(projectMember.userId, context.session.user.id),
					eq(projectMember.role, "owner")
				),
			});

			if (!ownerMembership) {
				throw new ORPCError("FORBIDDEN");
			}

			await context.db
				.update(invitation)
				.set({ status: "expired" })
				.where(eq(invitation.id, input.invitationId));
			return { success: true };
		}),
	create: protectedProcedure
		.input(
			z.object({
				email: z.string().email(),
				projectId: z.string().uuid(),
				role: z.enum(["admin", "member"]).optional(),
			})
		)
		.handler(async ({ context, input }) => {
			const membership = await requireMember(
				context.db,
				context.session.user.id,
				input.projectId
			);
			if (membership.role === "member") {
				throw new ORPCError("FORBIDDEN");
			}

			const existing = await context.db.query.invitation.findFirst({
				where: and(
					eq(invitation.projectId, input.projectId),
					eq(invitation.email, input.email),
					eq(invitation.status, "pending")
				),
			});
			if (existing) {
				throw new ORPCError("BAD_REQUEST");
			}

			const expiresAt = new Date();
			expiresAt.setDate(expiresAt.getDate() + 7);

			const [newInvitation] = await context.db
				.insert(invitation)
				.values({
					email: input.email,
					expiresAt,
					invitedBy: context.session.user.id,
					projectId: input.projectId,
					role: input.role ?? "member",
				})
				.returning();

			if (!newInvitation) {
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}

			return newInvitation;
		}),

	list: protectedProcedure
		.input(z.object({ projectId: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			await requireMember(context.db, context.session.user.id, input.projectId);
			return context.db.query.invitation.findMany({
				where: and(
					eq(invitation.projectId, input.projectId),
					eq(invitation.status, "pending")
				),
			});
		}),
};
