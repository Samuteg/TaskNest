import { user } from "@TaskNest/db";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure } from "../index";

export const profileRouter = {
	update: protectedProcedure
		.input(
			z.object({
				email: z.string().email().optional(),
				name: z.string().min(1).max(100).optional(),
			})
		)
		.handler(async ({ context, input }) => {
			const [updated] = await context.db
				.update(user)
				.set({
					...(input.name !== undefined && { name: input.name }),
					...(input.email !== undefined && { email: input.email }),
				})
				.where(eq(user.id, context.session.user.id))
				.returning();

			if (!updated) {
				throw new ORPCError("NOT_FOUND");
			}

			return updated;
		}),
};
