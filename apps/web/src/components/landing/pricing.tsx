import { Button } from "@TaskNest/ui/components/button";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

const FEATURES = [
	"Up to 5 active projects",
	"Unlimited tasks and Kanban boards",
	"Up to 3 team members per project",
	"Role-based access (Owner/Admin/Member)",
	"Real-time updates across devices",
	"Email-based team invitations",
	"Dark and light mode",
	"Self-hostable with Docker",
] as const;

export function Pricing() {
	return (
		<section className="border-y bg-muted/20 py-24">
			<div className="container mx-auto max-w-6xl space-y-16 px-4">
				<div className="mx-auto max-w-2xl space-y-4 text-center">
					<h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
						Free for individuals and small teams
					</h2>
					<p className="text-muted-foreground text-sm sm:text-base">
						No credit card. No hidden limits. Use it as-is or self-host for full
						control.
					</p>
				</div>

				<div className="mx-auto max-w-lg">
					<div className="relative flex flex-col justify-between rounded-2xl border-2 border-primary bg-card p-8 shadow-xl">
						<div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
							<span className="rounded-full bg-primary px-3 py-0.5 font-semibold text-primary-foreground text-xs">
								Free Forever
							</span>
						</div>

						<div className="space-y-4 pt-4">
							<div>
								<h3 className="font-bold text-lg">Starter / Community</h3>
								<p className="mt-1 text-muted-foreground text-xs">
									For individual developers, side projects, and small teams.
								</p>
							</div>
							<div className="flex items-baseline gap-1">
								<span className="font-extrabold font-mono text-5xl tracking-tight">
									$0
								</span>
								<span className="text-muted-foreground text-xs">
									/ forever free
								</span>
							</div>
						</div>

						<div className="space-y-3 border-t pt-6">
							{FEATURES.map((feature) => (
								<li className="flex items-start gap-2.5 text-xs" key={feature}>
									<div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
										<Check className="h-3 w-3" />
									</div>
									<span>{feature}</span>
								</li>
							))}
						</div>

						<div className="pt-6">
							<Link className="w-full" to="/login">
								<Button className="h-11 w-full font-semibold text-sm">
									Create Free Account
								</Button>
							</Link>
						</div>
					</div>
				</div>

				<p className="text-center text-muted-foreground text-xs">
					Need more projects or team members?{" "}
					<a
						className="underline underline-offset-2 hover:text-foreground"
						href="https://github.com/Samuteg/TaskNest/issues"
						rel="noopener noreferrer"
						target="_blank"
					>
						Open an issue
					</a>{" "}
					to request it.
				</p>
			</div>
		</section>
	);
}
