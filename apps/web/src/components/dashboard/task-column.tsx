import type { AppRouterClient } from "@TaskNest/api/routers/index";
import { Badge } from "@TaskNest/ui/components/badge";
import { Button } from "@TaskNest/ui/components/button";
import { useDroppable } from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useCallback } from "react";

import { TaskCard } from "./task-card";

type Task = Awaited<ReturnType<AppRouterClient["tasks"]["list"]>>[number];

const statusMeta = {
	done: {
		bg: "bg-green-50/20 dark:bg-green-950/10",
		border: "border-green-200/40",
		title: "Done",
	},
	in_progress: {
		bg: "bg-blue-50/20 dark:bg-blue-950/10",
		border: "border-blue-200/40",
		title: "In Progress",
	},
	todo: { bg: "bg-muted/40", border: "border-muted", title: "To Do" },
} as const;

export function TaskColumn({
	status,
	tasks,
	onTaskClick,
	onAddTask,
	isOver,
}: {
	status: "todo" | "in_progress" | "done";
	tasks: Task[];
	onTaskClick: (task: Task) => void;
	onAddTask: (status: "todo" | "in_progress" | "done") => void;
	isOver?: boolean;
}) {
	const meta = statusMeta[status];
	const taskIds = tasks.map((t) => t.id);

	const { setNodeRef } = useDroppable({
		data: { status },
		id: `column-${status}`,
	});

	const handleAddClick = useCallback(() => {
		onAddTask(status);
	}, [onAddTask, status]);

	return (
		<div
			className={`flex flex-col rounded-lg border transition-colors ${meta.border} ${meta.bg} min-h-[500px] w-80 shrink-0 p-3 ${
				isOver ? "ring-2 ring-primary/30" : ""
			}`}
			ref={setNodeRef}
		>
			<div className="flex items-center justify-between pb-3">
				<div className="flex items-center gap-2">
					<h3 className="font-semibold text-sm">{meta.title}</h3>
					<Badge className="px-1.5 py-0 text-xs" variant="secondary">
						{tasks.length}
					</Badge>
				</div>
				<Button
					className="h-7 w-7"
					onClick={handleAddClick}
					size="icon"
					variant="ghost"
				>
					<Plus className="h-4 w-4" />
				</Button>
			</div>

			<SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
				<div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
					{tasks.map((task) => (
						<TaskCardItem key={task.id} onTaskClick={onTaskClick} task={task} />
					))}
					{tasks.length === 0 ? (
						<div className="flex flex-1 items-center justify-center p-4 text-center">
							<p className="text-muted-foreground text-xs">
								No tasks in this column
							</p>
						</div>
					) : null}
				</div>
			</SortableContext>
		</div>
	);
}

function TaskCardItem({
	task,
	onTaskClick,
}: {
	task: Task;
	onTaskClick: (task: Task) => void;
}) {
	const handleClick = useCallback(() => {
		onTaskClick(task);
	}, [onTaskClick, task]);

	return <TaskCard onClick={handleClick} task={task} />;
}
