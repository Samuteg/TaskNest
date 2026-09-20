import type { AppRouterClient } from "@TaskNest/api/routers/index";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@TaskNest/ui/components/avatar";
import { Badge } from "@TaskNest/ui/components/badge";
import { Card, CardContent } from "@TaskNest/ui/components/card";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, GripVertical } from "lucide-react";
import type { MouseEvent } from "react";
import { TagBadge } from "@/components/tags/tag-badge";

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

function TaskTags({ task, indent }: { indent?: boolean; task: Task }) {
	if (task.tags.length === 0) {
		return null;
	}
	return (
		<div
			className={`flex flex-wrap items-center gap-1 ${indent ? "pl-5.5" : ""}`}
		>
			{task.tags.slice(0, 3).map((t) => (
				<TagBadge color={t.color} key={t.id} name={t.name} />
			))}
			{task.tags.length > 3 ? (
				<span className="text-[10px] text-muted-foreground">
					+{task.tags.length - 3}
				</span>
			) : null}
		</div>
	);
}

function handleDragHandleClick(e: MouseEvent) {
	e.stopPropagation();
}

export function TaskCard({
	task,
	onClick,
	isOverlay,
}: {
	task: Task;
	onClick?: () => void;
	isOverlay?: boolean;
}) {
	const priority = priorityBadges[task.priority] ?? priorityBadges.medium;

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		data: { task },
		disabled: isOverlay,
		id: task.id,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	if (isOverlay) {
		return (
			<Card className="cursor-grabbing border-primary/50 shadow-lg">
				<CardContent className="space-y-2 p-3">
					<div className="flex items-start justify-between gap-2">
						<h4 className="font-medium text-sm leading-snug">{task.title}</h4>
						<Badge
							className={`px-1.5 py-0 text-[10px] ${priority.className}`}
							variant={priority.variant}
						>
							{priority.label}
						</Badge>
					</div>
					{task.description ? (
						<p className="line-clamp-2 text-muted-foreground text-xs">
							{task.description}
						</p>
					) : null}
					<TaskTags task={task} />
					<div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
						{task.dueDate ? (
							<div className="flex items-center gap-1">
								<CalendarDays className="h-3 w-3" />
								<span>{new Date(task.dueDate).toLocaleDateString()}</span>
							</div>
						) : (
							<div />
						)}
						{task.assignee ? (
							<div className="flex items-center gap-1">
								<Avatar className="h-5 w-5">
									<AvatarImage src={task.assignee.image ?? undefined} />
									<AvatarFallback className="text-[9px]">
										{task.assignee.name.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<span className="max-w-[80px] truncate text-[11px]">
									{task.assignee.name}
								</span>
							</div>
						) : null}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div
			className={isDragging ? "opacity-30" : ""}
			ref={setNodeRef}
			style={style}
		>
			<Card
				className="group relative border transition-all hover:border-primary/50 hover:shadow-xs"
				onClick={onClick}
			>
				<CardContent className="space-y-2 p-3">
					<div className="flex items-start justify-between gap-2">
						<div className="flex min-w-0 flex-1 items-start gap-1.5">
							<button
								className="mt-0.5 shrink-0 cursor-grab text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
								type="button"
								{...attributes}
								{...listeners}
								aria-label="Drag task"
								onClick={handleDragHandleClick}
							>
								<GripVertical className="h-4 w-4" />
							</button>
							<h4 className="truncate font-medium text-sm leading-snug">
								{task.title}
							</h4>
						</div>
						<Badge
							className={`shrink-0 px-1.5 py-0 text-[10px] ${priority.className}`}
							variant={priority.variant}
						>
							{priority.label}
						</Badge>
					</div>

					{task.description ? (
						<p className="line-clamp-2 pl-5.5 text-muted-foreground text-xs">
							{task.description}
						</p>
					) : null}

					<TaskTags indent task={task} />

					<div className="flex items-center justify-between pt-1 pl-5.5 text-[11px] text-muted-foreground">
						{task.dueDate ? (
							<div className="flex items-center gap-1">
								<CalendarDays className="h-3 w-3" />
								<span>{new Date(task.dueDate).toLocaleDateString()}</span>
							</div>
						) : (
							<div />
						)}

						{task.assignee ? (
							<div className="flex items-center gap-1">
								<Avatar className="h-5 w-5">
									<AvatarImage src={task.assignee.image ?? undefined} />
									<AvatarFallback className="text-[9px]">
										{task.assignee.name.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<span className="max-w-[80px] truncate text-[11px]">
									{task.assignee.name}
								</span>
							</div>
						) : null}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
