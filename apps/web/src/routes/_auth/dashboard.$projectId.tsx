import type { AppRouterClient } from "@TaskNest/api/routers/index";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import {
	type PriorityFilter,
	ProjectHeader,
	type ViewMode,
} from "@/components/dashboard/project-header";
import { TaskBoard } from "@/components/dashboard/task-board";
import { TaskCreateModal } from "@/components/dashboard/task-create-modal";
import { TaskDetailModal } from "@/components/dashboard/task-detail-modal";
import { TaskListView } from "@/components/dashboard/task-list-view";
import { orpc } from "@/utils/orpc";

type Task = Awaited<ReturnType<AppRouterClient["tasks"]["list"]>>[number];

export const Route = createFileRoute("/_auth/dashboard/$projectId")({
	component: ProjectDetailPage,
});

function ProjectDetailPage() {
	const { projectId } = Route.useParams();

	const [viewMode, setViewMode] = useState<ViewMode>("board");
	const [searchQuery, setSearchQuery] = useState("");
	const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);
	const [isCreateOpen, setIsCreateOpen] = useState(false);

	const project = useQuery(
		orpc.projects.get.queryOptions({ input: { projectId } })
	);
	const tasks = useQuery(
		orpc.tasks.list.queryOptions({ input: { projectId } })
	);

	const handleOpenCreate = useCallback(() => {
		setIsCreateOpen(true);
	}, []);

	const handleCloseCreate = useCallback(() => {
		setIsCreateOpen(false);
	}, []);

	const handleCloseDetail = useCallback(() => {
		setSelectedTask(null);
	}, []);

	const filteredTasks = useMemo(() => {
		const list = tasks.data ?? [];
		return list.filter((t) => {
			if (priorityFilter !== "all" && t.priority !== priorityFilter) {
				return false;
			}
			const query = searchQuery.trim().toLowerCase();
			if (!query) {
				return true;
			}
			const matchTitle = t.title.toLowerCase().includes(query);
			const matchDesc = Boolean(t.description?.toLowerCase().includes(query));
			return matchTitle || matchDesc;
		});
	}, [tasks.data, priorityFilter, searchQuery]);

	if (project.isLoading || tasks.isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<p className="animate-pulse text-muted-foreground text-sm">
					Loading project...
				</p>
			</div>
		);
	}

	if (project.isError || !project.data) {
		return (
			<div className="flex h-64 items-center justify-center">
				<p className="text-destructive text-sm">
					Project not found or access denied.
				</p>
			</div>
		);
	}

	const allTasks = tasks.data ?? [];

	return (
		<div className="flex h-full flex-col overflow-hidden">
			<ProjectHeader
				onNewTask={handleOpenCreate}
				onPriorityFilterChange={setPriorityFilter}
				onSearchChange={setSearchQuery}
				onViewModeChange={setViewMode}
				priorityFilter={priorityFilter}
				project={project.data}
				searchQuery={searchQuery}
				tasks={allTasks}
				viewMode={viewMode}
			/>

			<div className="flex-1 overflow-y-auto">
				{viewMode === "board" ? (
					<TaskBoard projectId={projectId} tasks={filteredTasks} />
				) : (
					<TaskListView
						onTaskClick={setSelectedTask}
						projectId={projectId}
						tasks={filteredTasks}
					/>
				)}
			</div>

			{isCreateOpen ? (
				<TaskCreateModal
					defaultStatus="todo"
					onClose={handleCloseCreate}
					projectId={projectId}
				/>
			) : null}

			{selectedTask ? (
				<TaskDetailModal onClose={handleCloseDetail} task={selectedTask} />
			) : null}
		</div>
	);
}
