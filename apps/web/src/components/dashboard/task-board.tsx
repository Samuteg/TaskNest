import type { AppRouterClient } from "@TaskNest/api/routers/index";
import {
	closestCorners,
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";

import { TaskCard } from "./task-card";
import { TaskColumn } from "./task-column";
import { TaskCreateModal } from "./task-create-modal";
import { TaskDetailModal } from "./task-detail-modal";

type Task = Awaited<ReturnType<AppRouterClient["tasks"]["list"]>>[number];
type Status = "todo" | "in_progress" | "done";

export function TaskBoard({
	projectId,
	tasks,
}: {
	projectId: string;
	tasks: Task[];
}) {
	const queryClient = useQueryClient();
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);
	const [createStatus, setCreateStatus] = useState<Status | null>(null);
	const [activeTask, setActiveTask] = useState<Task | null>(null);
	const [overColumn, setOverColumn] = useState<Status | null>(null);

	const updateStatus = useMutation(
		orpc.tasks.updateStatus.mutationOptions({
			onError: (err, _variables, context) => {
				const ctx = context as
					| { previousTasks: Task[] | undefined; queryKey: unknown[] }
					| undefined;
				if (ctx?.previousTasks) {
					queryClient.setQueryData(ctx.queryKey, ctx.previousTasks);
				}
				toast.error(err.message || "Failed to update status");
			},
			onMutate: async ({ taskId, status }) => {
				const queryKey = orpc.tasks.list.queryKey({ input: { projectId } });
				await queryClient.cancelQueries({ queryKey });

				const previousTasks = queryClient.getQueryData<Task[]>(queryKey);

				queryClient.setQueryData<Task[]>(queryKey, (old) => {
					if (!old) {
						return old;
					}
					return old.map((t) => (t.id === taskId ? { ...t, status } : t));
				});

				return { previousTasks, queryKey };
			},
			onSettled: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.tasks.list.queryKey({ input: { projectId } }),
				});
			},
		})
	);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 5,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragStart = useCallback(
		(event: DragStartEvent) => {
			const { active } = event;
			const found = tasks.find((t) => t.id === active.id);
			if (found) {
				setActiveTask(found);
			}
		},
		[tasks]
	);

	const getTargetStatus = useCallback(
		(overId: string | number): Status | null => {
			if (typeof overId === "string") {
				if (overId.startsWith("column-")) {
					return overId.replace("column-", "") as Status;
				}
				const targetTask = tasks.find((t) => t.id === overId);
				if (targetTask) {
					return targetTask.status as Status;
				}
			}
			return null;
		},
		[tasks]
	);

	const handleDragOver = useCallback(
		(event: DragOverEvent) => {
			const { over } = event;
			if (!over) {
				setOverColumn(null);
				return;
			}
			const targetStatus = getTargetStatus(over.id);
			setOverColumn(targetStatus);
		},
		[getTargetStatus]
	);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;
			setActiveTask(null);
			setOverColumn(null);

			if (!over) {
				return;
			}

			const targetStatus = getTargetStatus(over.id);
			const draggedTask = tasks.find((t) => t.id === active.id);

			if (draggedTask && targetStatus && draggedTask.status !== targetStatus) {
				updateStatus.mutate({
					status: targetStatus,
					taskId: draggedTask.id,
				});
			}
		},
		[getTargetStatus, tasks, updateStatus]
	);

	const handleDragCancel = useCallback(() => {
		setActiveTask(null);
		setOverColumn(null);
	}, []);

	const handleCloseCreate = useCallback(() => {
		setCreateStatus(null);
	}, []);

	const handleCloseDetail = useCallback(() => {
		setSelectedTask(null);
	}, []);

	const todoTasks = tasks.filter((t) => t.status === "todo");
	const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
	const doneTasks = tasks.filter((t) => t.status === "done");

	return (
		<DndContext
			collisionDetection={closestCorners}
			onDragCancel={handleDragCancel}
			onDragEnd={handleDragEnd}
			onDragOver={handleDragOver}
			onDragStart={handleDragStart}
			sensors={sensors}
		>
			<div className="flex-1 overflow-x-auto p-6">
				<div className="flex items-start gap-6">
					<TaskColumn
						isOver={overColumn === "todo"}
						onAddTask={setCreateStatus}
						onTaskClick={setSelectedTask}
						status="todo"
						tasks={todoTasks}
					/>
					<TaskColumn
						isOver={overColumn === "in_progress"}
						onAddTask={setCreateStatus}
						onTaskClick={setSelectedTask}
						status="in_progress"
						tasks={inProgressTasks}
					/>
					<TaskColumn
						isOver={overColumn === "done"}
						onAddTask={setCreateStatus}
						onTaskClick={setSelectedTask}
						status="done"
						tasks={doneTasks}
					/>
				</div>
			</div>

			<DragOverlay>
				{activeTask ? <TaskCard isOverlay task={activeTask} /> : null}
			</DragOverlay>

			{createStatus ? (
				<TaskCreateModal
					defaultStatus={createStatus}
					onClose={handleCloseCreate}
					projectId={projectId}
				/>
			) : null}

			{selectedTask ? (
				<TaskDetailModal onClose={handleCloseDetail} task={selectedTask} />
			) : null}
		</DndContext>
	);
}
