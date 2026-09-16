import type { AppRouterClient } from "@TaskNest/api/routers/index";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@TaskNest/ui/components/avatar";
import { Badge } from "@TaskNest/ui/components/badge";
import { Button } from "@TaskNest/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@TaskNest/ui/components/dialog";
import { Label } from "@TaskNest/ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@TaskNest/ui/components/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Trash2 } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";

type Task = Awaited<ReturnType<AppRouterClient["tasks"]["list"]>>[number];

const priorityBadges = {
	high: {
		className: "text-orange-600 border-orange-200",
		label: "High",
		variant: "secondary" as const,
	},
	low: {
		className: "text-blue-600 border-blue-200",
		label: "Low",
		variant: "outline" as const,
	},
	medium: {
		className: "text-yellow-600 border-yellow-200",
		label: "Medium",
		variant: "secondary" as const,
	},
	urgent: { className: "", label: "Urgent", variant: "destructive" as const },
};

export function TaskDetailModal({
	task,
	onClose,
}: {
	task: Task;
	onClose: () => void;
}) {
	const queryClient = useQueryClient();
	const members = useQuery(
		orpc.members.list.queryOptions({ input: { projectId: task.projectId } })
	);

	const updateStatus = useMutation(
		orpc.tasks.updateStatus.mutationOptions({
			onError: (err) => {
				toast.error(err.message);
			},
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.tasks.list.queryKey({
						input: { projectId: task.projectId },
					}),
				});
				toast.success("Task status updated");
			},
		})
	);

	const updateTask = useMutation(
		orpc.tasks.update.mutationOptions({
			onError: (err) => {
				toast.error(err.message);
			},
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.tasks.list.queryKey({
						input: { projectId: task.projectId },
					}),
				});
				toast.success("Task updated");
			},
		})
	);

	const deleteTask = useMutation(
		orpc.tasks.delete.mutationOptions({
			onError: (err) => {
				toast.error(err.message);
			},
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.tasks.list.queryKey({
						input: { projectId: task.projectId },
					}),
				});
				toast.success("Task deleted");
				onClose();
			},
		})
	);

	const priority = priorityBadges[task.priority] ?? priorityBadges.medium;

	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (!open) {
				onClose();
			}
		},
		[onClose]
	);

	const handleStatusChange = useCallback(
		(val: string | null) => {
			if (val) {
				updateStatus.mutate({
					status: val as "todo" | "in_progress" | "done",
					taskId: task.id,
				});
			}
		},
		[updateStatus, task.id]
	);

	const handleAssigneeChange = useCallback(
		(val: string | null) => {
			updateTask.mutate({
				assigneeId: val === "unassigned" ? null : (val ?? null),
				taskId: task.id,
			});
		},
		[updateTask, task.id]
	);

	const handleDelete = useCallback(() => {
		deleteTask.mutate({ taskId: task.id });
	}, [deleteTask, task.id]);

	return (
		<Dialog onOpenChange={handleOpenChange} open>
			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader className="flex flex-row items-center justify-between space-y-0">
					<DialogTitle className="font-semibold text-base">
						{task.title}
					</DialogTitle>
					<Badge
						className={`text-xs ${priority.className}`}
						variant={priority.variant}
					>
						{priority.label}
					</Badge>
				</DialogHeader>

				<div className="space-y-4 pt-2">
					{task.description ? (
						<div className="rounded-md bg-muted/40 p-3 text-xs leading-relaxed">
							{task.description}
						</div>
					) : (
						<p className="text-muted-foreground text-xs italic">
							No description provided.
						</p>
					)}

					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1">
							<Label className="text-muted-foreground text-xs">Status</Label>
							<Select onValueChange={handleStatusChange} value={task.status}>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="todo">To Do</SelectItem>
									<SelectItem value="in_progress">In Progress</SelectItem>
									<SelectItem value="done">Done</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-1">
							<Label className="text-muted-foreground text-xs">Assignee</Label>
							<Select
								onValueChange={handleAssigneeChange}
								value={task.assigneeId ?? "unassigned"}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Assignee" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="unassigned">Unassigned</SelectItem>
									{members.data?.map((m) => (
										<SelectItem key={m.userId} value={m.userId}>
											{m.user.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{task.dueDate ? (
						<div className="flex items-center gap-2 pt-1 text-muted-foreground text-xs">
							<CalendarDays className="h-4 w-4" />
							<span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
						</div>
					) : null}

					{task.assignee ? (
						<div className="flex items-center gap-2 pt-1">
							<Avatar className="h-6 w-6">
								<AvatarImage src={task.assignee.image ?? undefined} />
								<AvatarFallback className="text-[10px]">
									{task.assignee.name.charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="text-xs">
								<p className="font-medium">{task.assignee.name}</p>
								<p className="text-[10px] text-muted-foreground">
									{task.assignee.email}
								</p>
							</div>
						</div>
					) : null}

					<div className="flex items-center justify-between border-t pt-4">
						<Button
							className="gap-1.5"
							disabled={deleteTask.isPending}
							onClick={handleDelete}
							size="sm"
							variant="destructive"
						>
							<Trash2 className="h-3.5 w-3.5" />
							<span>Delete</span>
						</Button>
						<Button onClick={onClose} size="sm" variant="outline">
							Close
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
