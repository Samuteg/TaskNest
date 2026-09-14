import { Link, useRouterState } from "@tanstack/react-router";
import { FolderKanban } from "lucide-react";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
	const router = useRouterState();
	const isAuthRoute =
		router.location.pathname.startsWith("/dashboard") ||
		router.location.pathname.startsWith("/settings");

	if (isAuthRoute) {
		return null;
	}

	return (
		<header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-xs">
			<div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
				<Link className="flex items-center gap-2 font-bold text-base" to="/">
					<FolderKanban className="h-5 w-5 text-primary" />
					<span>TaskNest</span>
				</Link>
				<div className="flex items-center gap-3">
					<ModeToggle />
					<UserMenu />
				</div>
			</div>
		</header>
	);
}
