import type { AppRouterClient } from "@TaskNest/api/routers/index";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@TaskNest/ui/components/avatar";
import { Badge } from "@TaskNest/ui/components/badge";
import { Button } from "@TaskNest/ui/components/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@TaskNest/ui/components/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@TaskNest/ui/components/table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	ArrowUpDown,
	CalendarDays,
	CheckCircle2,
	Clock,
	ListTodo,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";

type Task = Awaited<ReturnType<AppRouterClient["tasks"]["list"]>>[number];
type SortField = "title" | "priority" | "status" | "dueDate";
type SortOrder = "asc" | "desc";

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

const priorityOrder = { high: 3, low: 1, medium: 2, urgent: 4 };
const statusOrder = { done: 3, in_progress: 2, todo: 1 };

export function TaskListView({
	projectId,
	tasks,
	onTaskClick,
}: {
	projectId: string;
	tasks: Task[];
	onTaskClick: (task: Task) => void;
}) {
	const queryClient = useQueryClient();
	const [sortField, setSortField] = useState<SortField>("title");
	const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

	const updateStatus = useMutation(
		orpc.tasks.updateStatus.mutationOptions({
			onError: (err) => {
				toast.error(err.message || "Failed to update status");
			},
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.tasks.list.queryKey({ input: { projectId } }),
				});
				toast.success("Task status updated");
			},
		})
	);

	const handleSort = useCallback(
		(field: SortField) => {
			if (sortField === field) {
				setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
			} else {
				setSortField(field);
				setSortOrder("asc");
			}
		},
		[sortField]
	);

	const sortedTasks = useMemo(() => {
		const list = [...tasks];

		function compareTasks(a: Task, b: Task) {
			if (sortField === "title") {
				return a.title.localeCompare(b.title);
			}
			if (sortField === "priority") {
				return (
					(priorityOrder[a.priority] ?? 0) - (priorityOrder[b.priority] ?? 0)
				);
			}
			if (sortField === "status") {
				return (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0);
			}
			const dateA = a.dueDate
				? new Date(a.dueDate).getTime()
				: Number.MAX_SAFE_INTEGER;
			const dateB = b.dueDate
				? new Date(b.dueDate).getTime()
				: Number.MAX_SAFE_INTEGER;
			return dateA - dateB;
		}

		list.sort((a, b) => {
			const res = compareTasks(a, b);
			return sortOrder === "asc" ? res : -res;
		});

		return list;
	}, [tasks, sortField, sortOrder]);

	const handleSortStatus = useCallback(
		() => handleSort("status"),
		[handleSort]
	);
	const handleSortTitle = useCallback(() => handleSort("title"), [handleSort]);
	const handleSortPriority = useCallback(
		() => handleSort("priority"),
		[handleSort]
	);
	const handleSortDueDate = useCallback(
		() => handleSort("dueDate"),
		[handleSort]
	);

	if (tasks.length === 0) {
		return (
			<div className="flex h-64 flex-col items-center justify-center p-8 text-center">
				<ListTodo className="mb-3 h-10 w-10 text-muted-foreground/40" />
				<h3 className="font-semibold text-base">No tasks found</h3>
				<p className="mt-1 text-muted-foreground text-xs">
					Try clearing your search or filters to see all tasks.
				</p>
			</div>
		);
	}

	return (
		<div className="p-6">
			<div className="rounded-md border bg-card shadow-xs">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-36">
								<Button
									className="h-7 gap-1 px-1 font-semibold text-xs"
									onClick={handleSortStatus}
									variant="ghost"
								>
									<span>Status</span>
									<ArrowUpDown className="h-3 w-3" />
								</Button>
							</TableHead>
							<TableHead>
								<Button
									className="h-7 gap-1 px-1 font-semibold text-xs"
									onClick={handleSortTitle}
									variant="ghost"
								>
									<span>Title</span>
									<ArrowUpDown className="h-3 w-3" />
								</Button>
							</TableHead>
							<TableHead className="w-28">
								<Button
									className="h-7 gap-1 px-1 font-semibold text-xs"
									onClick={handleSortPriority}
									variant="ghost"
								>
									<span>Priority</span>
									<ArrowUpDown className="h-3 w-3" />
								</Button>
							</TableHead>
							<TableHead className="w-40">Assignee</TableHead>
							<TableHead className="w-32">
								<Button
									className="h-7 gap-1 px-1 font-semibold text-xs"
									onClick={handleSortDueDate}
									variant="ghost"
								>
									<span>Due Date</span>
									<ArrowUpDown className="h-3 w-3" />
								</Button>
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{sortedTasks.map((task) => (
							<TaskRow
								key={task.id}
								onTaskClick={onTaskClick}
								task={task}
								updateStatus={updateStatus}
							/>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

function handleTableCellClick(e: React.MouseEvent) {
	e.stopPropagation();
}

function TaskRow({
	task,
	onTaskClick,
	updateStatus,
}: {
	task: Task;
	onTaskClick: (task: Task) => void;
	updateStatus: {
		mutate: (input: {
			taskId: string;
			status: "todo" | "in_progress" | "done";
		}) => void;
	};
}) {
	const priority = priorityBadges[task.priority] ?? priorityBadges.medium;

	const handleRowClick = useCallback(() => {
		onTaskClick(task);
	}, [onTaskClick, task]);

	const handleStatusChange = useCallback(
		(val: "todo" | "in_progress" | "done" | null) => {
			if (val) {
				updateStatus.mutate({ status: val, taskId: task.id });
			}
		},
		[task.id, updateStatus]
	);

	return (
		<TableRow
			className="cursor-pointer transition-colors hover:bg-muted/50"
			onClick={handleRowClick}
		>
			<TableCell onClick={handleTableCellClick}>
				<Select onValueChange={handleStatusChange} value={task.status}>
					<SelectTrigger className="h-7 w-32 text-xs">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="todo">
							<span className="flex items-center gap-1.5">
								<Clock className="h-3 w-3 text-muted-foreground" /> To Do
							</span>
						</SelectItem>
						<SelectItem value="in_progress">
							<span className="flex items-center gap-1.5">
								<Clock className="h-3 w-3 text-blue-500" /> In Progress
							</span>
						</SelectItem>
						<SelectItem value="done">
							<span className="flex items-center gap-1.5">
								<CheckCircle2 className="h-3 w-3 text-green-500" /> Done
							</span>
						</SelectItem>
					</SelectContent>
				</Select>
			</TableCell>

			<TableCell>
				<div className="space-y-0.5">
					<p className="font-medium text-foreground text-sm leading-tight">
						{task.title}
					</p>
					{task.description ? (
						<p className="line-clamp-1 text-muted-foreground text-xs">
							{task.description}
						</p>
					) : null}
				</div>
			</TableCell>

			<TableCell>
				<Badge
					className={`px-1.5 py-0 text-[10px] ${priority.className}`}
					variant={priority.variant}
				>
					{priority.label}
				</Badge>
			</TableCell>

			<TableCell>
				{task.assignee ? (
					<div className="flex items-center gap-1.5">
						<Avatar className="h-5 w-5">
							<AvatarImage src={task.assignee.image ?? undefined} />
							<AvatarFallback className="text-[9px]">
								{task.assignee.name.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<span className="max-w-[100px] truncate text-xs">
							{task.assignee.name}
						</span>
					</div>
				) : (
					<span className="text-muted-foreground text-xs italic">
						Unassigned
					</span>
				)}
			</TableCell>

			<TableCell>
				{task.dueDate ? (
					<div className="flex items-center gap-1 text-muted-foreground text-xs">
						<CalendarDays className="h-3 w-3" />
						<span>{new Date(task.dueDate).toLocaleDateString()}</span>
					</div>
				) : (
					<span className="text-muted-foreground text-xs">—</span>
				)}
			</TableCell>
		</TableRow>
	);
}
