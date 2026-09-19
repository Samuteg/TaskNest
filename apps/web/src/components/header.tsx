import { Button } from "@TaskNest/ui/components/button";
import { Link, useRouterState } from "@tanstack/react-router";
import { Code2, FolderKanban } from "lucide-react";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

const NAV_LINKS = [
	{ href: "/#features", label: "Features" },
	{ href: "/#self-host", label: "Self-host" },
	{ href: "/#faq", label: "FAQ" },
] as const;

export default function Header() {
	const router = useRouterState();
	const isAuthRoute =
		router.location.pathname.startsWith("/dashboard") ||
		router.location.pathname.startsWith("/settings");

	if (isAuthRoute) {
		return null;
	}

	const isLanding = router.location.pathname === "/";

	return (
		<header className="sticky top-0 z-40 border-border/50 border-b bg-background/90 backdrop-blur-sm">
			<div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
				<Link className="flex items-center gap-2 font-bold text-base" to="/">
					<FolderKanban className="h-5 w-5 text-primary" />
					<span>TaskNest</span>
				</Link>

				{isLanding && (
					<nav className="hidden items-center gap-6 md:flex">
						{NAV_LINKS.map((link) => (
							<a
								className="text-muted-foreground text-sm transition-colors hover:text-foreground"
								href={link.href}
								key={link.href}
							>
								{link.label}
							</a>
						))}
					</nav>
				)}

				<div className="flex items-center gap-2">
					{isLanding && (
						<>
							<a
								aria-label="View TaskNest on GitHub"
								href="https://github.com/Samuteg/TaskNest"
								rel="noopener noreferrer"
								target="_blank"
							>
								<Button size="icon" variant="ghost">
									<Code2 className="h-4 w-4" />
								</Button>
							</a>
							<Link to="/login">
								<Button size="sm">Try Demo</Button>
							</Link>
						</>
					)}
					<ModeToggle />
					<UserMenu />
				</div>
			</div>
		</header>
	);
}
