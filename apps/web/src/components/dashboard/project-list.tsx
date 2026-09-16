import { Input } from "@TaskNest/ui/components/input";
import { useQuery } from "@tanstack/react-query";
import { FolderKanban, Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { orpc } from "@/utils/orpc";

import { ProjectCard } from "./project-card";
import { ProjectCreateModal } from "./project-create-modal";

function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
			<FolderKanban className="mb-4 h-12 w-12 text-muted-foreground/50" />
			<h3 className="font-semibold text-lg">No projects yet</h3>
			<p className="mt-1 mb-4 max-w-sm text-muted-foreground text-sm">
				Get started by creating your first project to organize tasks and invite
				team members.
			</p>
			<ProjectCreateModal />
		</div>
	);
}

function NoResults() {
	return (
		<div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
			<Search className="mb-4 h-10 w-10 text-muted-foreground/50" />
			<h3 className="font-semibold text-base">No projects found</h3>
			<p className="mt-1 text-muted-foreground text-sm">
				Try a different search term.
			</p>
		</div>
	);
}

export function ProjectList() {
	const projects = useQuery(orpc.projects.list.queryOptions());
	const [search, setSearch] = useState("");

	const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(e.target.value);
	}, []);

	const filteredProjects = useMemo(() => {
		const list = projects.data ?? [];
		if (!search.trim()) {
			return list;
		}
		const q = search.toLowerCase();
		return list.filter((p) => p.name.toLowerCase().includes(q));
	}, [projects.data, search]);

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
	const hasProjects = projectData.length > 0;
	const hasResults = filteredProjects.length > 0;

	return (
		<div className="mx-auto max-w-7xl space-y-6 p-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">Projects</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Manage your workspaces, track tasks, and collaborate with your team.
					</p>
				</div>
				<ProjectCreateModal />
			</div>

			{hasProjects ? (
				<div className="relative max-w-sm">
					<Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						className="h-9 pl-8 text-sm"
						onChange={handleSearch}
						placeholder="Search projects..."
						value={search}
					/>
				</div>
			) : null}

			{hasProjects && hasResults ? (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{filteredProjects.map((project) => (
						<ProjectCard key={project.id} project={project} />
					))}
				</div>
			) : null}

			{hasProjects ? null : <EmptyState />}

			{hasProjects && !hasResults ? <NoResults /> : null}
		</div>
	);
}
