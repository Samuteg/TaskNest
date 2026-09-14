import type { RouterClient } from "@orpc/server";

import { protectedProcedure, publicProcedure } from "../index";

import { invitationsRouter } from "./invitations";
import { membersRouter } from "./members";
import { profileRouter } from "./profile";
import { projectsRouter } from "./projects";
import { tasksRouter } from "./tasks";

export const appRouter = {
	healthCheck: publicProcedure.handler(() => "OK"),
	invitations: invitationsRouter,
	members: membersRouter,
	privateData: protectedProcedure.handler(({ context }) => ({
		message: "This is private",
		user: context.session?.user,
	})),
	profile: profileRouter,
	projects: projectsRouter,
	tasks: tasksRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
