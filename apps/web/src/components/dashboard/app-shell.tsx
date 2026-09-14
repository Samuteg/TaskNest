import { Outlet } from "@tanstack/react-router";

import { Sidebar } from "./sidebar";

export function AppShell() {
	return (
		<div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
			<Sidebar />
			<main className="flex-1 overflow-y-auto">
				<Outlet />
			</main>
		</div>
	);
}
