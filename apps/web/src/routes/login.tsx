import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/login")({
	beforeLoad: async () => {
		const s = await authClient.getSession();
		if (s.data) {
			throw redirect({ search: { verified: undefined }, to: "/dashboard" });
		}
	},
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>) => ({
		verified: (search.verified === "1" ? "1" : undefined) as "1" | undefined,
	}),
});

function RouteComponent() {
	const [showSignIn, setShowSignIn] = useState(false);
	const { verified } = Route.useSearch();

	if (verified === "1") {
		toast.success("Email verified. You can sign in now.");
	}

	return showSignIn ? (
		<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
	) : (
		<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
	);
}
