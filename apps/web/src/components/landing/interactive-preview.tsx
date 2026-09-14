import { Avatar, AvatarFallback } from "@TaskNest/ui/components/avatar";
import { Badge } from "@TaskNest/ui/components/badge";
import { Button } from "@TaskNest/ui/components/button";
import { Card, CardContent } from "@TaskNest/ui/components/card";
import {
	ArrowRight,
	Calendar,
	CheckCircle2,
	Clock,
	Plus,
	Sparkles,
} from "lucide-react";
import { useCallback, useState } from "react";

type DemoTask = {
	id: string;
	title: string;
	tag: string;
	priority: "urgent" | "high" | "medium" | "low";
	status: "todo" | "in_progress" | "done";
	assignee: string;
	dueDate: string;
};

const INITIAL_TASKS: DemoTask[] = [
	{
		assignee: "AR",
		dueDate: "Tomorrow",
		id: "task-1",
		priority: "high",
		status: "todo",
		tag: "Security",
		title: "Implement OAuth2 & Magic Links",
	},
	{
		assignee: "ER",
		dueDate: "Oct 12",
		id: "task-2",
		priority: "urgent",
		status: "in_progress",
		tag: "Frontend",
		title: "Build Responsive Kanban Board UI",
	},
	{
		assignee: "MV",
		dueDate: "Completed",
		id: "task-3",
		priority: "medium",
		status: "done",
		tag: "Database",
		title: "PostgreSQL Schema Migrations",
	},
	{
		assignee: "SK",
		dueDate: "Oct 14",
		id: "task-4",
		priority: "high",
		status: "in_progress",
		tag: "Backend",
		title: "Setup oRPC Type-Safe Handlers",
	},
];

const priorityBadges = {
	high: "bg-amber-500/10 text-amber-500 border-amber-500/20",
	low: "bg-slate-500/10 text-slate-500 border-slate-500/20",
	medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
	urgent: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function InteractivePreview() {
	const [tasks, setTasks] = useState<DemoTask[]>(INITIAL_TASKS);
	const [activeFilter, setActiveFilter] = useState<string>("all");

	const moveTask = useCallback(
		(taskId: string, newStatus: "todo" | "in_progress" | "done") => {
			setTasks((prev) =>
				prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
			);
		},
		[]
	);

	const filteredTasks = tasks.filter((t) =>
		activeFilter === "all"
			? true
			: t.tag.toLowerCase() === activeFilter.toLowerCase()
	);

	const todoList = filteredTasks.filter((t) => t.status === "todo");
	const inProgressList = filteredTasks.filter(
		(t) => t.status === "in_progress"
	);
	const doneList = filteredTasks.filter((t) => t.status === "done");

	return (
		<div className="relative mx-auto w-full max-w-5xl rounded-2xl border bg-card/80 p-4 shadow-2xl backdrop-blur-md md:p-6">
			{/* Top Header Bar */}
			<div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<Sparkles className="h-5 w-5" />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<h3 className="font-semibold text-sm">
								Sprint 42 — Core Platform Launch
							</h3>
							<Badge className="text-[10px]" variant="outline">
								Active
							</Badge>
						</div>
						<p className="text-muted-foreground text-xs">
							Interactive Live Demo — Click arrows to shift task statuses
						</p>
					</div>
				</div>

				{/* Filter tags */}
				<div className="flex flex-wrap items-center gap-1.5">
					{["all", "Frontend", "Backend", "Security", "Database"].map(
						(filter) => (
							<button
								className={`rounded-full px-2.5 py-1 font-medium text-xs transition-all ${
									activeFilter === filter
										? "bg-primary text-primary-foreground shadow-xs"
										: "bg-muted/60 text-muted-foreground hover:bg-muted"
								}`}
								key={filter}
								onClick={() => setActiveFilter(filter)}
								type="button"
							>
								{filter.charAt(0).toUpperCase() + filter.slice(1)}
							</button>
						)
					)}
				</div>
			</div>

			{/* 3-Column Board */}
			<div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
				{/* TO DO COLUMN */}
				<div className="flex flex-col rounded-xl border border-border/60 bg-muted/20 p-3">
					<div className="flex items-center justify-between pb-3">
						<div className="flex items-center gap-2">
							<span className="h-2 w-2 rounded-full bg-slate-400" />
							<h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
								To Do
							</h4>
							<Badge className="h-5 px-1.5 text-[10px]" variant="secondary">
								{todoList.length}
							</Badge>
						</div>
						<Button className="h-6 w-6" size="icon" variant="ghost">
							<Plus className="h-3.5 w-3.5" />
						</Button>
					</div>

					<div className="flex flex-1 flex-col gap-2.5">
						{todoList.map((task) => (
							<Card
								className="border shadow-xs transition-all hover:border-primary/40"
								key={task.id}
							>
								<CardContent className="space-y-2 p-3">
									<div className="flex items-start justify-between gap-2">
										<Badge
											className={`px-1.5 py-0 text-[9px] ${priorityBadges[task.priority]}`}
											variant="outline"
										>
											{task.priority}
										</Badge>
										<span className="font-mono text-[10px] text-muted-foreground">
											{task.tag}
										</span>
									</div>
									<p className="font-medium text-xs leading-snug">
										{task.title}
									</p>
									<div className="flex items-center justify-between border-t pt-1 text-[11px] text-muted-foreground">
										<div className="flex items-center gap-1.5">
											<Avatar className="h-5 w-5">
												<AvatarFallback className="bg-primary/10 text-[9px] text-primary">
													{task.assignee}
												</AvatarFallback>
											</Avatar>
											<span className="flex items-center gap-1">
												<Clock className="h-3 w-3" />
												{task.dueDate}
											</span>
										</div>
										<button
											className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 font-medium text-[10px] text-primary transition-colors hover:bg-primary/20"
											onClick={() => moveTask(task.id, "in_progress")}
											title="Move to In Progress"
											type="button"
										>
											<span>Start</span>
											<ArrowRight className="h-3 w-3" />
										</button>
									</div>
								</CardContent>
							</Card>
						))}
						{todoList.length === 0 && (
							<p className="py-8 text-center text-muted-foreground/60 text-xs italic">
								No items in queue
							</p>
						)}
					</div>
				</div>

				{/* IN PROGRESS COLUMN */}
				<div className="flex flex-col rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
					<div className="flex items-center justify-between pb-3">
						<div className="flex items-center gap-2">
							<span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
							<h4 className="font-semibold text-blue-600 text-xs uppercase tracking-wider dark:text-blue-400">
								In Progress
							</h4>
							<Badge className="h-5 px-1.5 text-[10px]" variant="secondary">
								{inProgressList.length}
							</Badge>
						</div>
						<Button className="h-6 w-6" size="icon" variant="ghost">
							<Plus className="h-3.5 w-3.5" />
						</Button>
					</div>

					<div className="flex flex-1 flex-col gap-2.5">
						{inProgressList.map((task) => (
							<Card
								className="border border-blue-500/30 shadow-xs transition-all hover:border-blue-500/60"
								key={task.id}
							>
								<CardContent className="space-y-2 p-3">
									<div className="flex items-start justify-between gap-2">
										<Badge
											className={`px-1.5 py-0 text-[9px] ${priorityBadges[task.priority]}`}
											variant="outline"
										>
											{task.priority}
										</Badge>
										<span className="font-mono text-[10px] text-muted-foreground">
											{task.tag}
										</span>
									</div>
									<p className="font-medium text-xs leading-snug">
										{task.title}
									</p>
									<div className="flex items-center justify-between border-t pt-1 text-[11px] text-muted-foreground">
										<div className="flex items-center gap-1.5">
											<Avatar className="h-5 w-5">
												<AvatarFallback className="bg-blue-500/10 text-[9px] text-blue-600">
													{task.assignee}
												</AvatarFallback>
											</Avatar>
											<span className="flex items-center gap-1">
												<Calendar className="h-3 w-3" />
												{task.dueDate}
											</span>
										</div>
										<div className="flex items-center gap-1">
											<button
												className="inline-flex items-center gap-1 rounded bg-green-500/10 px-2 py-0.5 font-medium text-[10px] text-green-600 transition-colors hover:bg-green-500/20 dark:text-green-400"
												onClick={() => moveTask(task.id, "done")}
												title="Mark Complete"
												type="button"
											>
												<CheckCircle2 className="h-3 w-3" />
												<span>Done</span>
											</button>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>

				{/* DONE COLUMN */}
				<div className="flex flex-col rounded-xl border border-green-500/20 bg-green-500/5 p-3">
					<div className="flex items-center justify-between pb-3">
						<div className="flex items-center gap-2">
							<span className="h-2 w-2 rounded-full bg-green-500" />
							<h4 className="font-semibold text-green-600 text-xs uppercase tracking-wider dark:text-green-400">
								Done
							</h4>
							<Badge className="h-5 px-1.5 text-[10px]" variant="secondary">
								{doneList.length}
							</Badge>
						</div>
						<Button className="h-6 w-6" size="icon" variant="ghost">
							<Plus className="h-3.5 w-3.5" />
						</Button>
					</div>

					<div className="flex flex-1 flex-col gap-2.5">
						{doneList.map((task) => (
							<Card
								className="border border-green-500/20 opacity-90 shadow-xs"
								key={task.id}
							>
								<CardContent className="space-y-2 p-3">
									<div className="flex items-start justify-between gap-2">
										<Badge
											className="border-green-500/20 bg-green-500/10 px-1.5 py-0 text-[9px] text-green-600"
											variant="outline"
										>
											Completed
										</Badge>
										<span className="font-mono text-[10px] text-muted-foreground line-through">
											{task.tag}
										</span>
									</div>
									<p className="font-medium text-muted-foreground text-xs leading-snug line-through">
										{task.title}
									</p>
									<div className="flex items-center justify-between border-t pt-1 text-[11px] text-muted-foreground">
										<div className="flex items-center gap-1.5">
											<Avatar className="h-5 w-5">
												<AvatarFallback className="bg-green-500/10 text-[9px] text-green-600">
													{task.assignee}
												</AvatarFallback>
											</Avatar>
											<span className="font-medium text-[10px] text-green-600 dark:text-green-400">
												Shipped
											</span>
										</div>
										<button
											className="text-[10px] text-muted-foreground transition-colors hover:text-foreground"
											onClick={() => moveTask(task.id, "in_progress")}
											title="Reopen task"
											type="button"
										>
											Reopen
										</button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
