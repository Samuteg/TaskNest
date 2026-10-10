import { user } from "@TaskNest/db";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure } from "../index";

export const profileRouter = {
	update: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1).max(100).optional(),
			})
		)
		.handler(async ({ context, input }) => {
			// ponytail: email changes only via a verified Better-Auth flow (needs SMTP); add when a provider is configured.
			if (input.name === undefined) {
				throw new ORPCError("BAD_REQUEST");
			}
			const [updated] = await context.db
				.update(user)
				.set({ name: input.name })
				.where(eq(user.id, context.session.user.id))
				.returning();

			if (!updated) {
				throw new ORPCError("NOT_FOUND");
			}

			return updated;
		}),
};
