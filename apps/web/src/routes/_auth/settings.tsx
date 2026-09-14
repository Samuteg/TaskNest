import { createFileRoute } from "@tanstack/react-router";

import { ProfileForm } from "@/components/settings/profile-form";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	const { data: session } = authClient.useSession();
	const user = session?.user;

	if (!user) {
		return null;
	}

	return (
		<div className="mx-auto max-w-2xl space-y-6 p-8">
			<div>
				<h1 className="font-bold text-3xl tracking-tight">Account Settings</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					Manage your personal profile and account preferences.
				</p>
			</div>

			<ProfileForm user={{ name: user.name, email: user.email }} />
		</div>
	);
}
