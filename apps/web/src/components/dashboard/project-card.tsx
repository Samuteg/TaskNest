import type { AppRouterClient } from "@TaskNest/api/routers/index";
import { Badge } from "@TaskNest/ui/components/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@TaskNest/ui/components/card";
import { Link } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Clock, FolderKanban } from "lucide-react";

type Project = Awaited<ReturnType<AppRouterClient["projects"]["list"]>>[number];

export function ProjectCard({ project }: { project: Project }) {
	const progressPercentage =
		project.taskCount > 0
			? Math.round((project.doneCount / project.taskCount) * 100)
			: 0;

	const pendingCount = project.taskCount - project.doneCount;

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
					{pendingCount > 0 ? (
						<Badge className="ml-auto gap-1 text-[10px]" variant="destructive">
							<AlertCircle className="h-2.5 w-2.5" />
							<span>{pendingCount} pending</span>
						</Badge>
					) : null}
				</CardHeader>
				<CardContent className="space-y-3">
					<p className="line-clamp-2 min-h-[2rem] text-muted-foreground text-xs">
						{project.description ?? "No description provided."}
					</p>

					{project.taskCount > 0 ? (
						<div className="space-y-2">
							<div className="flex items-center justify-between text-[10px]">
								<span className="text-muted-foreground">Progress</span>
								<span className="font-semibold">{progressPercentage}%</span>
							</div>
							<div className="h-1.5 overflow-hidden rounded-full bg-muted">
								<div
									className="h-full bg-primary transition-all duration-300"
									style={{ width: `${progressPercentage}%` }}
								/>
							</div>
							<div className="flex items-center gap-3 text-[10px] text-muted-foreground">
								<span className="flex items-center gap-1">
									<CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
									{project.doneCount}
								</span>
								<span className="flex items-center gap-1">
									<Clock className="h-3 w-3 text-blue-600 dark:text-blue-400" />
									{project.inProgressCount}
								</span>
								<span className="flex items-center gap-1">
									<span className="h-3 w-3 text-center text-muted-foreground/60">
										•
									</span>
									{project.todoCount}
								</span>
								<span className="ml-auto">{project.taskCount} total</span>
							</div>
						</div>
					) : (
						<p className="text-[10px] text-muted-foreground italic">
							No tasks yet
						</p>
					)}

					<p className="text-[10px] text-muted-foreground">
						Created {new Date(project.createdAt).toLocaleDateString()}
					</p>
				</CardContent>
			</Card>
		</Link>
	);
}
