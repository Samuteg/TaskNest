import { Badge } from "@TaskNest/ui/components/badge";
import { useCallback, useState } from "react";

const STEPS = [
	{
		badge: "STEP 01",
		description:
			"Create your project and invite your team members. Set roles (Owner, Admin, Member) to control who can manage settings and who can contribute to tasks.",
		id: "create",
		short: "Create",
		title: "Create Projects & Invite Team",
	},
	{
		badge: "STEP 02",
		description:
			"Break your project into tasks. Each task gets a title, description, priority level, and optional due date. Assign team members to own each task.",
		id: "organize",
		short: "Organize",
		title: "Organize Tasks with Kanban",
	},
	{
		badge: "STEP 03",
		description:
			"Drag tasks between columns as work progresses. Everyone on the team sees updates in real-time. Filter by assignee or priority to focus on what matters.",
		id: "collaborate",
		short: "Collaborate",
		title: "Track & Collaborate in Real-Time",
	},
	{
		badge: "STEP 04",
		description:
			"Monitor project health with status overview. See what's done, what's in progress, and what's blocked. Keep your team aligned and shipping fast.",
		id: "deliver",
		short: "Deliver",
		title: "Deliver with Confidence",
	},
] as const;

export function Workflow() {
	const [activeStepIndex, setActiveStepIndex] = useState(0);
	const currentStep = STEPS[activeStepIndex];

	const setStep = useCallback((idx: number) => {
		setActiveStepIndex(idx);
	}, []);

	const handleStepClick = useCallback(
		(e: React.MouseEvent<HTMLButtonElement>) => {
			const idx = Number(e.currentTarget.dataset.step);
			setStep(idx);
		},
		[setStep]
	);

	return (
		<section className="border-b bg-muted/30 py-24">
			<div className="container mx-auto max-w-6xl space-y-12 px-4">
				<div className="space-y-4 text-center">
					<Badge
						className="inline-flex gap-1.5 px-3 py-1 text-xs"
						variant="outline"
					>
						How It Works
					</Badge>
					<h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
						From idea to shipped in four steps
					</h2>
					<p className="mx-auto max-w-2xl text-muted-foreground text-sm">
						A streamlined workflow designed for small teams that move fast.
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
							data-step={idx}
							key={step.id}
							onClick={handleStepClick}
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
						<div className="flex items-center gap-4 pt-2">
							<div className="flex items-center gap-2">
								<span className="h-2 w-2 rounded-full bg-green-500" />
								<span className="text-muted-foreground text-xs">
									Step {activeStepIndex + 1} of {STEPS.length}
								</span>
							</div>
							<div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
								<div
									className="h-full rounded-full bg-primary transition-all duration-300"
									style={{
										width: `${((activeStepIndex + 1) / STEPS.length) * 100}%`,
									}}
								/>
							</div>
						</div>
					</div>

					<div className="lg:col-span-6">
						<div className="relative rounded-2xl border bg-card/80 p-6 shadow-xl backdrop-blur-sm">
							<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent" />
							<div className="relative space-y-4">
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary text-sm">
										{String(activeStepIndex + 1).padStart(2, "0")}
									</div>
									<div>
										<p className="font-semibold text-sm">{currentStep.title}</p>
										<p className="text-muted-foreground text-xs">
											{currentStep.badge}
										</p>
									</div>
								</div>
								<div className="space-y-3 rounded-lg border bg-muted/30 p-4">
									<p className="text-muted-foreground text-sm leading-relaxed">
										{currentStep.description}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
