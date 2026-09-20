import { Button } from "@TaskNest/ui/components/button";
import { Separator } from "@TaskNest/ui/components/separator";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { FolderKanban, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { useCallback } from "react";

import { ModeToggle } from "@/components/mode-toggle";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

const DASHBOARD_PROJECT_PATH = /^\/dashboard\/([^/]+)/;

export function Sidebar() {
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { data: session } = authClient.useSession();
	const projects = useQuery(orpc.projects.list.queryOptions());

	const currentProjectId = pathname.match(DASHBOARD_PROJECT_PATH)?.[1];

	const handleSignOut = useCallback(async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					navigate({ to: "/login" });
				},
			},
		});
	}, [navigate]);

	return (
		<aside className="flex h-screen w-64 flex-col border-r bg-card">
			<div className="flex items-center justify-between p-4">
				<Link
					className="flex items-center gap-2 font-bold text-lg"
					to="/dashboard"
				>
					<FolderKanban className="h-6 w-6 text-primary" />
					<span>TaskNest</span>
				</Link>
				<ModeToggle />
			</div>

			<Separator />

			<div className="p-3">
				<Link
					className="flex items-center gap-2 rounded-md px-3 py-2 font-medium text-sm transition-colors hover:bg-accent"
					to="/dashboard"
				>
					<LayoutDashboard className="h-4 w-4" />
					<span>All Projects</span>
				</Link>
			</div>

			<div className="flex-1 overflow-y-auto px-3">
				<div className="mb-2 px-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
					Projects
				</div>
				<div className="space-y-1">
					{projects.data?.map((p) => (
						<Link
							className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent [&.active]:bg-accent [&.active]:font-medium"
							key={p.id}
							params={{ projectId: p.id }}
							to="/dashboard/$projectId"
						>
							<FolderKanban className="h-4 w-4 text-muted-foreground" />
							<span className="truncate">{p.name}</span>
						</Link>
					))}
				</div>
			</div>

			<Separator />

			<div className="space-y-1 p-3">
				{currentProjectId ? (
					<Link
						className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent [&.active]:bg-accent [&.active]:font-medium"
						params={{ projectId: currentProjectId }}
						to="/dashboard/$projectId/settings"
					>
						<Settings className="h-4 w-4" />
						<span>Project Settings</span>
					</Link>
				) : null}
				<Link
					className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent [&.active]:bg-accent [&.active]:font-medium"
					to="/settings"
				>
					<Settings className="h-4 w-4" />
					<span>Account Settings</span>
				</Link>
				<div className="flex items-center justify-between px-3 py-2">
					<div className="truncate">
						<p className="truncate font-medium text-xs">
							{session?.user?.name}
						</p>
						<p className="truncate text-muted-foreground text-xs">
							{session?.user?.email}
						</p>
					</div>
					<Button
						onClick={handleSignOut}
						size="icon"
						title="Sign Out"
						variant="ghost"
					>
						<LogOut className="h-4 w-4 text-muted-foreground hover:text-destructive" />
					</Button>
				</div>
			</div>
		</aside>
	);
}
