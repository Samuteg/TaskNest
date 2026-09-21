import type { AppRouterClient } from "@TaskNest/api/routers/index";
import { Badge } from "@TaskNest/ui/components/badge";
import { Button } from "@TaskNest/ui/components/button";
import { Input } from "@TaskNest/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@TaskNest/ui/components/select";
import { Link } from "@tanstack/react-router";
import {
	AlertCircle,
	CheckCircle2,
	Clock,
	Kanban,
	ListFilter,
	Plus,
	Search,
	Settings,
	Table as TableIcon,
} from "lucide-react";
import { type ChangeEvent, useCallback } from "react";
import { TagBadge } from "@/components/tags/tag-badge";
import type { TagSummary } from "@/components/tags/tag-editor";

type Project = NonNullable<
	Awaited<ReturnType<AppRouterClient["projects"]["get"]>>
>;
type Task = Awaited<ReturnType<AppRouterClient["tasks"]["list"]>>[number];

export type ViewMode = "board" | "list";
export type PriorityFilter = "all" | "low" | "medium" | "high" | "urgent";

export function ProjectHeader({
	project,
	tasks,
	viewMode,
	onViewModeChange,
	searchQuery,
	onSearchChange,
	priorityFilter,
	onPriorityFilterChange,
	allTags,
	selectedTagIds,
	onTagToggle,
	onNewTask,
}: {
	project: Project;
	tasks: Task[];
	viewMode: ViewMode;
	onViewModeChange: (mode: ViewMode) => void;
	searchQuery: string;
	onSearchChange: (query: string) => void;
	priorityFilter: PriorityFilter;
	onPriorityFilterChange: (priority: PriorityFilter) => void;
	allTags: TagSummary[];
	selectedTagIds: string[];
	onTagToggle: (tagId: string) => void;
	onNewTask: () => void;
}) {
	const totalTasks = tasks.length;
	const doneTasks = tasks.filter((t) => t.status === "done").length;
	const inProgressTasks = tasks.filter(
		(t) => t.status === "in_progress"
	).length;
	const todoTasks = tasks.filter((t) => t.status === "todo").length;
	const progressPercentage =
		totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

	const now = new Date();
	const overdueCount = tasks.filter(
		(t) => t.status !== "done" && t.dueDate && new Date(t.dueDate) < now
	).length;

	const handleSearch = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			onSearchChange(e.target.value);
		},
		[onSearchChange]
	);

	const handlePrioritySelect = useCallback(
		(val: PriorityFilter | null) => {
			if (val) {
				onPriorityFilterChange(val);
			}
		},
		[onPriorityFilterChange]
	);

	const handleSetBoardView = useCallback(() => {
		onViewModeChange("board");
	}, [onViewModeChange]);

	const handleSetListView = useCallback(() => {
		onViewModeChange("list");
	}, [onViewModeChange]);

	return (
		<div className="border-b bg-card">
			{/* Top Bar: Title, Description, Actions */}
			<div className="flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
				<div className="space-y-1">
					<div className="flex items-center gap-3">
						<h1 className="font-bold text-2xl tracking-tight">
							{project.name}
						</h1>
						{overdueCount > 0 ? (
							<Badge className="gap-1 text-xs" variant="destructive">
								<AlertCircle className="h-3 w-3" />
								<span>{overdueCount} overdue</span>
							</Badge>
						) : null}
					</div>
					{project.description ? (
						<p className="text-muted-foreground text-xs">
							{project.description}
						</p>
					) : null}
				</div>

				<div className="flex items-center gap-2">
					<Button className="gap-1.5" onClick={onNewTask} size="sm">
						<Plus className="h-4 w-4" />
						<span>New Task</span>
					</Button>
					<Link
						params={{ projectId: project.id }}
						to="/dashboard/$projectId/settings"
					>
						<Button className="gap-1.5" size="sm" variant="outline">
							<Settings className="h-4 w-4" />
							<span className="hidden sm:inline">Settings</span>
						</Button>
					</Link>
				</div>
			</div>

			{/* Progress & Stats Bar */}
			<div className="flex flex-wrap items-center justify-between gap-4 border-t bg-muted/20 px-6 py-2.5 text-xs">
				<div className="flex flex-wrap items-center gap-4">
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground">Progress:</span>
						<div className="h-2 w-28 overflow-hidden rounded-full bg-muted">
							<div
								className="h-full bg-primary transition-all duration-300"
								style={{ width: `${progressPercentage}%` }}
							/>
						</div>
						<span className="font-semibold">{progressPercentage}%</span>
					</div>

					<div className="flex items-center gap-3 border-l pl-4 text-muted-foreground">
						<span className="flex items-center gap-1">
							<CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
							<strong className="text-foreground">{doneTasks}</strong> Done
						</span>
						<span className="flex items-center gap-1">
							<Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
							<strong className="text-foreground">{inProgressTasks}</strong> In
							Progress
						</span>
						<span className="flex items-center gap-1">
							<strong className="text-foreground">{todoTasks}</strong> To Do
						</span>
					</div>
				</div>

				{/* Total count */}
				<div className="text-muted-foreground">
					Total:{" "}
					<span className="font-medium text-foreground">{totalTasks}</span>{" "}
					tasks
				</div>
			</div>

			{/* Filter & View Switcher Bar */}
			<div className="flex flex-col gap-3 border-t px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-1 items-center gap-2">
					<div className="relative max-w-xs flex-1">
						<Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							className="h-8 pl-8 text-xs"
							onChange={handleSearch}
							placeholder="Search tasks..."
							value={searchQuery}
						/>
					</div>

					<Select onValueChange={handlePrioritySelect} value={priorityFilter}>
						<SelectTrigger className="h-8 w-32 text-xs">
							<ListFilter className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
							<SelectValue placeholder="Priority" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Priorities</SelectItem>
							<SelectItem value="urgent">Urgent</SelectItem>
							<SelectItem value="high">High</SelectItem>
							<SelectItem value="medium">Medium</SelectItem>
							<SelectItem value="low">Low</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* View Mode Switcher */}
				<div className="flex items-center rounded-lg border bg-muted/40 p-0.5">
					<Button
						className={`h-7 gap-1.5 px-2.5 text-xs ${
							viewMode === "board"
								? "bg-background text-foreground shadow-xs"
								: "text-muted-foreground hover:text-foreground"
						}`}
						onClick={handleSetBoardView}
						size="sm"
						variant="ghost"
					>
						<Kanban className="h-3.5 w-3.5" />
						<span>Board</span>
					</Button>
					<Button
						className={`h-7 gap-1.5 px-2.5 text-xs ${
							viewMode === "list"
								? "bg-background text-foreground shadow-xs"
								: "text-muted-foreground hover:text-foreground"
						}`}
						onClick={handleSetListView}
						size="sm"
						variant="ghost"
					>
						<TableIcon className="h-3.5 w-3.5" />
						<span>List</span>
					</Button>
				</div>
			</div>

			{/* Tag Filter Row */}
			{allTags.length > 0 ? (
				<div className="flex flex-wrap items-center gap-1.5 border-t bg-muted/20 px-6 py-2">
					<span className="text-muted-foreground text-xs">Tags:</span>
					{allTags.map((t) => {
						const isActive = selectedTagIds.includes(t.id);
						return (
							<button
								aria-pressed={isActive}
								className={`rounded-full transition-opacity focus-visible:outline-2 focus-visible:outline-offset-1 ${
									isActive
										? "ring-1 ring-primary/40"
										: "opacity-45 hover:opacity-90"
								}`}
								key={t.id}
								onClick={() => onTagToggle(t.id)}
								type="button"
							>
								<TagBadge color={t.color} name={t.name} />
							</button>
						);
					})}
				</div>
			) : null}
		</div>
	);
}
