import { createFileRoute, redirect } from "@tanstack/react-router";

import { AppShell } from "@/components/dashboard/app-shell";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth")({
	component: AppShell,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			throw redirect({
				search: { verified: undefined },
				to: "/login",
			});
		}
		return { session };
	},
});
