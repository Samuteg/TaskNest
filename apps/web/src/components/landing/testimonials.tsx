import { Avatar, AvatarFallback } from "@TaskNest/ui/components/avatar";
import { Badge } from "@TaskNest/ui/components/badge";
import { Card, CardContent } from "@TaskNest/ui/components/card";
import { Star } from "lucide-react";

const TESTIMONIALS = [
	{
		avatar: "AR",
		name: "Alex Rivera",
		quote:
			"TaskNest streamlined our entire development cycle. The Kanban boards and rapid updates keep everyone aligned without daily status meetings.",
		rating: 5,
		role: "Head of Engineering at CloudScale",
	},
	{
		avatar: "ER",
		name: "Elena Rostova",
		quote:
			"The role management and frictionless invitations made onboarding new contractors completely seamless. Best developer tool we've adopted this year.",
		rating: 5,
		role: "Product Lead at NextWave",
	},
	{
		avatar: "MV",
		name: "Marcus Vance",
		quote:
			"Fast, responsive, and beautifully designed. It cuts out all the bloat of traditional enterprise project tools and lets us focus on shipping code.",
		rating: 5,
		role: "Founder at TaskFlow",
	},
	{
		avatar: "SC",
		name: "Sarah Chen",
		quote:
			"The fact that this uses TanStack Router and Query natively sold our team immediately. Zero re-render bloat, strict types, pure joy to work with.",
		rating: 5,
		role: "CTO at DevFlow",
	},
	{
		avatar: "DP",
		name: "David Park",
		quote:
			"We migrated from Jira in a single afternoon. The Kanban flow is incredibly smooth and the onboarding was practically instant for our entire team.",
		rating: 5,
		role: "Lead Developer at VectorOps",
	},
	{
		avatar: "MG",
		name: "Maria Garcia",
		quote:
			"Finally a task management tool that actually feels like it was built by engineers, for engineers. The API latency is unreal.",
		rating: 5,
		role: "Engineering Manager at HyperStack",
	},
] as const;

export function Testimonials() {
	return (
		<section className="border-y bg-muted/20 py-24">
			<div className="container mx-auto max-w-6xl space-y-12 px-4">
				<div className="mx-auto max-w-2xl space-y-4 text-center">
					<Badge className="px-3 py-1 text-xs" variant="outline">
						Loved by Developers
					</Badge>
					<h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
						Trusted by modern product teams
					</h2>
					<p className="text-muted-foreground text-sm">
						Here is what engineering leaders and product teams say about
						building with TaskNest.
					</p>
				</div>

				<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{TESTIMONIALS.map((t) => (
						<Card
							className="border bg-card shadow-xs transition-shadow hover:shadow-md"
							key={t.name}
						>
							<CardContent className="space-y-4 p-6">
								<div className="flex gap-0.5 text-amber-400">
									{Array.from({ length: t.rating }).map(() => (
										<Star
											className="h-4 w-4 fill-current"
											key={`star-${t.name}`}
										/>
									))}
								</div>
								<p className="text-foreground/80 text-xs leading-relaxed">
									"{t.quote}"
								</p>
								<div className="flex items-center gap-3 border-t pt-4">
									<Avatar className="h-10 w-10 border">
										<AvatarFallback className="bg-primary/10 font-bold text-primary text-xs">
											{t.avatar}
										</AvatarFallback>
									</Avatar>
									<div>
										<h4 className="font-semibold text-xs">{t.name}</h4>
										<p className="text-[11px] text-muted-foreground">
											{t.role}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
