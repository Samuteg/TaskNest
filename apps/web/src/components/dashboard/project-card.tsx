import type { AppRouterClient } from "@TaskNest/api/routers/index";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@TaskNest/ui/components/card";
import { Link } from "@tanstack/react-router";
import { FolderKanban } from "lucide-react";

type Project = Awaited<ReturnType<AppRouterClient["projects"]["list"]>>[number];

export function ProjectCard({ project }: { project: Project }) {
	return (
		<Link
			className="block transition-transform hover:scale-[1.01]"
			params={{ projectId: project.id }}
			to="/dashboard/$projectId"
		>
			<Card className="h-full border transition-colors hover:border-primary/50">
				<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
					<FolderKanban className="h-5 w-5 text-primary" />
					<CardTitle className="truncate font-semibold text-base">
						{project.name}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="line-clamp-3 min-h-[3rem] text-muted-foreground text-xs">
						{project.description ?? "No description provided."}
					</p>
					<p className="mt-4 text-[10px] text-muted-foreground">
						Created {new Date(project.createdAt).toLocaleDateString()}
					</p>
				</CardContent>
			</Card>
		</Link>
	);
}
