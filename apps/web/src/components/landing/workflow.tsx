import { Badge } from "@TaskNest/ui/components/badge";
import { Card, CardContent } from "@TaskNest/ui/components/card";
import { Check, CheckCircle, FolderPlus, Kanban, Send } from "lucide-react";
import { useCallback, useState } from "react";

const STEPS = [
	{
		badge: "Step 1",
		description:
			"Structure complex initiatives into clean, isolated projects with customizable descriptions and instant owner privileges.",
		id: "create",
		points: [
			"Custom project naming and metadata",
			"Automatic owner assignments and role seeding",
			"Instant multi-project sidebar access",
		],
		preview: {
			name: "Q4 Growth Engine",
			owner: "You (Owner)",
			tasksCount: "14 Tasks Active",
			type: "project" as const,
		},
		short: "Workspaces",
		title: "1. Create Dedicated Workspaces",
	},
	{
		badge: "Step 2",
		description:
			"Assign priorities (Urgent, High, Medium, Low), set real calendar due dates, and attach rich markdown task descriptions.",
		id: "tasks",
		points: [
			"4-level priority tagging with high-visibility badges",
			"Dynamic due-date tracking and status shifts",
			"Direct task assignee allocation",
		],
		preview: {
			assignee: "Alex Rivera",
			dueDate: "Oct 18, 2026",
			priority: "Urgent",
			title: "Migrate Auth to Session Tokens",
			type: "task" as const,
		},
		short: "Task Cards",
		title: "2. Organize Tasks with Rich Context",
	},
	{
		badge: "Step 3",
		description:
			"Send invitation links directly to email addresses. Manage permissions dynamically between Admins and standard Members.",
		id: "collaborate",
		points: [
			"Automatic 7-day expiration for security",
			"Granular Admin vs Member role control",
			"Real-time member status tracking",
		],
		preview: {
			email: "engineer@company.com",
			role: "Admin",
			status: "Invitation Sent",
			type: "invite" as const,
		},
		short: "Collaboration",
		title: "3. Invite Teammates via Email",
	},
	{
		badge: "Step 4",
		description:
			"Move tasks smoothly across To Do, In Progress, and Done. Keep your team aligned without daily status meetings.",
		id: "ship",
		points: [
			"Low latency real-time status transitions",
			"Zero friction developer experience",
			"Automatic progress invalidation",
		],
		preview: {
			columns: ["To Do (3)", "In Progress (5)", "Done (12)"],
			type: "board" as const,
			velocity: "+34% sprint speed",
		},
		short: "Kanban Board",
		title: "4. Track, Iterate, and Ship",
	},
] as const;

export function Workflow() {
	const [activeStepIndex, setActiveStepIndex] = useState(0);

	const setStep = useCallback((idx: number) => {
		setActiveStepIndex(idx);
	}, []);

	const currentStep = STEPS[activeStepIndex] ?? STEPS[0];

	return (
		<section className="py-24">
			<div className="container mx-auto max-w-6xl space-y-16 px-4">
				<div className="mx-auto max-w-2xl space-y-4 text-center">
					<Badge className="px-3 py-1 text-xs" variant="outline">
						How TaskNest Works
					</Badge>
					<h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
						From idea to deployment in 4 frictionless steps
					</h2>
					<p className="text-muted-foreground text-sm sm:text-base">
						Designed to get out of your way and let your team focus on
						high-impact engineering.
					</p>
				</div>

				{/* Tab triggers */}
				<div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-2 rounded-xl border bg-muted/40 p-1.5">
					{STEPS.map((step, idx) => (
						<button
							className={`min-w-[120px] flex-1 rounded-lg px-3 py-2.5 font-semibold text-xs transition-all ${
								activeStepIndex === idx
									? "border bg-card text-foreground shadow-xs"
									: "text-muted-foreground hover:text-foreground"
							}`}
							key={step.id}
							onClick={() => setStep(idx)}
							type="button"
						>
							{step.short}
						</button>
					))}
				</div>

				{/* Active Step Content */}
				<div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-8 lg:grid-cols-12">
					<div className="space-y-6 lg:col-span-6">
						<div className="inline-flex items-center gap-2">
							<Badge className="font-mono text-xs" variant="secondary">
								{currentStep.badge}
							</Badge>
						</div>
						<h3 className="font-bold text-2xl tracking-tight">
							{currentStep.title}
						</h3>
						<p className="text-muted-foreground text-sm leading-relaxed">
							{currentStep.description}
						</p>

						<ul className="space-y-3 pt-2">
							{currentStep.points.map((point) => (
								<li
									className="flex items-center gap-3 text-xs sm:text-sm"
									key={point}
								>
									<div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
										<Check className="h-3.5 w-3.5" />
									</div>
									<span>{point}</span>
								</li>
							))}
						</ul>
					</div>

					{/* Interactive Step Card Preview */}
					<div className="lg:col-span-6">
						<Card className="relative overflow-hidden border-2 border-primary/20 bg-card p-6 shadow-xl">
							<div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
							<CardContent className="space-y-4 p-0">
								<div className="flex items-center justify-between border-b pb-3">
									<span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
										TaskNest Live Architecture
									</span>
									<Badge className="text-[10px]" variant="outline">
										Interactive
									</Badge>
								</div>

								{currentStep.preview.type === "project" && (
									<div className="space-y-3 rounded-xl border bg-muted/30 p-4">
										<div className="flex items-center gap-3">
											<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
												<FolderPlus className="h-5 w-5" />
											</div>
											<div>
												<h4 className="font-bold text-sm">
													{currentStep.preview.name}
												</h4>
												<p className="text-muted-foreground text-xs">
													{currentStep.preview.owner}
												</p>
											</div>
										</div>
										<div className="flex items-center justify-between border-t pt-2 text-muted-foreground text-xs">
											<span>{currentStep.preview.tasksCount}</span>
											<span className="font-medium text-green-600 dark:text-green-400">
												Ready for Sprint
											</span>
										</div>
									</div>
								)}

								{currentStep.preview.type === "task" && (
									<div className="space-y-3 rounded-xl border bg-muted/30 p-4">
										<div className="flex items-center justify-between">
											<Badge className="text-[10px]" variant="destructive">
												{currentStep.preview.priority}
											</Badge>
											<span className="font-mono text-muted-foreground text-xs">
												{currentStep.preview.dueDate}
											</span>
										</div>
										<h4 className="font-semibold text-sm">
											{currentStep.preview.title}
										</h4>
										<div className="flex items-center gap-2 border-t pt-2 text-muted-foreground text-xs">
											<div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 font-bold text-[10px] text-primary">
												AR
											</div>
											<span>Assignee: {currentStep.preview.assignee}</span>
										</div>
									</div>
								)}

								{currentStep.preview.type === "invite" && (
									<div className="space-y-3 rounded-xl border bg-muted/30 p-4">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2 font-semibold text-xs">
												<Send className="h-4 w-4 text-primary" />
												<span>{currentStep.preview.email}</span>
											</div>
											<Badge className="text-[10px]" variant="secondary">
												{currentStep.preview.role}
											</Badge>
										</div>
										<p className="text-muted-foreground text-xs">
											An invitation token has been dispatched. Valid for 7 days.
										</p>
										<div className="flex items-center gap-2 border-t pt-2 text-green-600 text-xs dark:text-green-400">
											<CheckCircle className="h-4 w-4" />
											<span>{currentStep.preview.status}</span>
										</div>
									</div>
								)}

								{currentStep.preview.type === "board" && (
									<div className="space-y-3 rounded-xl border bg-muted/30 p-4">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<Kanban className="h-4 w-4 text-primary" />
												<span className="font-semibold text-xs">
													Kanban Flow
												</span>
											</div>
											<span className="font-mono font-semibold text-green-600 text-xs dark:text-green-400">
												{currentStep.preview.velocity}
											</span>
										</div>
										<div className="grid grid-cols-3 gap-2 pt-2">
											{currentStep.preview.columns?.map((col) => (
												<div
													className="rounded border bg-background p-2 text-center font-medium text-[11px]"
													key={col}
												>
													{col}
												</div>
											))}
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</section>
	);
}
