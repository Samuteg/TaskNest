import type { AppRouterClient } from "@TaskNest/api/routers/index";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@TaskNest/ui/components/avatar";
import { Badge } from "@TaskNest/ui/components/badge";
import { Card, CardContent } from "@TaskNest/ui/components/card";
import { CalendarDays } from "lucide-react";

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

export function TaskCard({
	task,
	onClick,
}: {
	task: Task;
	onClick: () => void;
}) {
	const priority = priorityBadges[task.priority] ?? priorityBadges.medium;

	return (
		<Card
			className="cursor-pointer border transition-all hover:border-primary/50 hover:shadow-xs"
			onClick={onClick}
		>
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
