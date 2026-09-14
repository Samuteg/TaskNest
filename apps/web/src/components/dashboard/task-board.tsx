import type { AppRouterClient } from "@TaskNest/api/routers/index";
import { Button } from "@TaskNest/ui/components/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { useState } from "react";
import { orpc } from "@/utils/orpc";

import { TaskColumn } from "./task-column";
import { TaskCreateModal } from "./task-create-modal";
import { TaskDetailModal } from "./task-detail-modal";

type Task = Awaited<ReturnType<AppRouterClient["tasks"]["list"]>>[number];

export function TaskBoard({ projectId }: { projectId: string }) {
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);
	const [createStatus, setCreateStatus] = useState<
		"todo" | "in_progress" | "done" | null
	>(null);

	const project = useQuery(
		orpc.projects.get.queryOptions({ input: { projectId } })
	);
	const tasks = useQuery(
		orpc.tasks.list.queryOptions({ input: { projectId } })
	);

	if (project.isLoading || tasks.isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<p className="animate-pulse text-muted-foreground text-sm">
					Loading board...
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

	const taskList = tasks.data ?? [];
	const todoTasks = taskList.filter((t) => t.status === "todo");
	const inProgressTasks = taskList.filter((t) => t.status === "in_progress");
	const doneTasks = taskList.filter((t) => t.status === "done");

	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center justify-between border-b px-6 py-4">
				<div>
					<h1 className="font-bold text-2xl tracking-tight">
						{project.data.name}
					</h1>
					{project.data.description ? (
						<p className="mt-0.5 text-muted-foreground text-xs">
							{project.data.description}
						</p>
					) : null}
				</div>
				<Link params={{ projectId }} to="/settings/$projectId">
					<Button className="gap-2" size="sm" variant="outline">
						<Settings className="h-4 w-4" />
						<span>Project Settings</span>
					</Button>
				</Link>
			</div>

			<div className="flex-1 overflow-x-auto p-6">
				<div className="flex items-start gap-6">
					<TaskColumn
						onAddTask={setCreateStatus}
						onTaskClick={setSelectedTask}
						status="todo"
						tasks={todoTasks}
					/>
					<TaskColumn
						onAddTask={setCreateStatus}
						onTaskClick={setSelectedTask}
						status="in_progress"
						tasks={inProgressTasks}
					/>
					<TaskColumn
						onAddTask={setCreateStatus}
						onTaskClick={setSelectedTask}
						status="done"
						tasks={doneTasks}
					/>
				</div>
			</div>

			{createStatus ? (
				<TaskCreateModal
					defaultStatus={createStatus}
					onClose={() => setCreateStatus(null)}
					projectId={projectId}
				/>
			) : null}

			{selectedTask ? (
				<TaskDetailModal
					onClose={() => setSelectedTask(null)}
					task={selectedTask}
				/>
			) : null}
		</div>
	);
}
