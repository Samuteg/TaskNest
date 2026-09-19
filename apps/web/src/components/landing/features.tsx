import { Badge } from "@TaskNest/ui/components/badge";
import { Card, CardContent } from "@TaskNest/ui/components/card";
import { Kanban, Layers, Lock, Users } from "lucide-react";

const FEATURES = [
	{
		description:
			"Drag tasks across To Do, In Progress, and Done. Updates appear instantly on every connected device — no refresh needed.",
		icon: Kanban,
		iconClass: "text-primary bg-primary/10",
		title: "Real-Time Kanban Boards",
	},
	{
		description:
			"Owner, Admin, and Member roles. Members can't delete projects or invite strangers. Set once, enforced everywhere.",
		icon: Users,
		iconClass: "text-blue-500 bg-blue-500/10",
		title: "Role-Based Access Control",
	},
	{
		description:
			"4 priority tiers — Urgent, High, Medium, Low — plus assignee tracking. Spot critical work at a glance on the board.",
		icon: Layers,
		iconClass: "text-amber-500 bg-amber-500/10",
		title: "Priorities & Assignees",
	},
	{
		description:
			"Email and password auth with session cookies and CSRF protection. Nothing to configure — works out of the box.",
		icon: Lock,
		iconClass: "text-emerald-500 bg-emerald-500/10",
		title: "Zero Config Auth",
	},
] as const;

const WORKFLOW = [
	{
		step: "01",
		text: "Create a project and invite your team with role-based permissions.",
	},
	{
		step: "02",
		text: "Break work into tasks with priorities, assignees, and due dates.",
	},
	{
		step: "03",
		text: "Drag to Done — everyone sees updates in real-time, no refresh.",
	},
] as const;

export function Features() {
	return (
		<section className="border-y bg-muted/30 py-20 md:py-28" id="features">
			<div className="container mx-auto max-w-6xl space-y-16 px-4">
				<div className="mx-auto max-w-2xl space-y-4 text-center">
					<Badge className="px-3 py-1 text-xs" variant="outline">
						Platform Capabilities
					</Badge>
					<h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
						What TaskNest actually does
					</h2>
					<p className="text-muted-foreground text-sm sm:text-base">
						No bloat. Just projects, tasks, Kanban boards, and team
						collaboration — done well.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{FEATURES.map((f) => (
						<Card className="border bg-card/50" key={f.title}>
							<CardContent className="space-y-3 p-6">
								<div
									className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${f.iconClass}`}
								>
									<f.icon className="h-5 w-5" />
								</div>
								<h3 className="font-semibold text-base">{f.title}</h3>
								<p className="text-muted-foreground text-sm leading-relaxed">
									{f.description}
								</p>
							</CardContent>
						</Card>
					))}
				</div>

				<div className="mx-auto max-w-3xl">
					<p className="mb-6 text-center font-medium text-muted-foreground text-xs uppercase tracking-widest">
						How it works in 3 steps
					</p>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
						{WORKFLOW.map((w) => (
							<div
								className="flex gap-4 rounded-xl border bg-card/40 p-5"
								key={w.step}
							>
								<span className="shrink-0 font-bold font-mono text-primary text-sm">
									{w.step}
								</span>
								<p className="text-muted-foreground text-sm leading-relaxed">
									{w.text}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
