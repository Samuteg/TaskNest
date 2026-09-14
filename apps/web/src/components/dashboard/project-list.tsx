import { useQuery } from "@tanstack/react-query";
import { FolderKanban } from "lucide-react";

import { orpc } from "@/utils/orpc";

import { ProjectCard } from "./project-card";
import { ProjectCreateModal } from "./project-create-modal";

export function ProjectList() {
	const projects = useQuery(orpc.projects.list.queryOptions());

	if (projects.isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<p className="animate-pulse text-muted-foreground text-sm">
					Loading projects...
				</p>
			</div>
		);
	}

	if (projects.isError) {
		return (
			<div className="flex h-64 items-center justify-center">
				<p className="text-destructive text-sm">
					Failed to load projects: {projects.error.message}
				</p>
			</div>
		);
	}

	const projectData = projects.data ?? [];

	return (
		<div className="mx-auto max-w-7xl space-y-8 p-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">Projects</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Manage your workspaces, track tasks, and collaborate with your team.
					</p>
				</div>
				<ProjectCreateModal />
			</div>

			{projectData.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
					<FolderKanban className="mb-4 h-12 w-12 text-muted-foreground/50" />
					<h3 className="font-semibold text-lg">No projects yet</h3>
					<p className="mt-1 mb-4 max-w-sm text-muted-foreground text-sm">
						Get started by creating your first project to organize tasks and
						invite team members.
					</p>
					<ProjectCreateModal />
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{projectData.map((project) => (
						<ProjectCard key={project.id} project={project} />
					))}
				</div>
			)}
		</div>
	);
}
