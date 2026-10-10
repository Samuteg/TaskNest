import { Button } from "@TaskNest/ui/components/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Code2 } from "lucide-react";

const FREE_FEATURES = [
	"Up to 5 active projects",
	"Unlimited tasks and Kanban boards",
	"Up to 3 team members per project",
	"Role-based access (Owner / Admin / Member)",
	"Real-time updates across devices",
	"Email-based team invitations",
	"Dark and light mode",
] as const;

const DOCKER_SNIPPET = `git clone https://github.com/Samuteg/TaskNest
cd TaskNest
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
docker compose up`;

export function Pricing() {
	return (
		<section className="border-y bg-muted/20 py-20 md:py-28" id="self-host">
			<div className="container mx-auto max-w-6xl space-y-12 px-4">
				<div className="mx-auto max-w-2xl space-y-4 text-center">
					<h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
						Free for individuals and small teams
					</h2>
					<p className="text-muted-foreground text-sm sm:text-base">
						No credit card. No hidden limits. Use the hosted demo or self-host
						for full control.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<div className="flex flex-col justify-between rounded-2xl border-2 border-primary bg-card p-8 shadow-lg">
						<div className="space-y-6">
							<div>
								<span className="inline-block rounded-full bg-primary px-3 py-0.5 font-semibold text-primary-foreground text-xs">
									Free Forever
								</span>
								<h3 className="mt-3 font-bold text-xl">Hosted Demo</h3>
								<p className="mt-1 text-muted-foreground text-sm">
									For individuals, side projects, and small teams.
								</p>
							</div>

							<div className="flex items-baseline gap-1">
								<span className="font-extrabold font-mono text-5xl tracking-tight">
									$0
								</span>
								<span className="text-muted-foreground text-xs">/ forever</span>
							</div>

							<ul className="space-y-2.5">
								{FREE_FEATURES.map((feature) => (
									<li
										className="flex items-start gap-2.5 text-sm"
										key={feature}
									>
										<div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
											<Check className="h-3 w-3" />
										</div>
										<span>{feature}</span>
									</li>
								))}
							</ul>
						</div>

						<div className="mt-8">
							<Link
								className="block w-full"
								search={{ verified: undefined }}
								to="/login"
							>
								<Button className="h-11 w-full font-semibold text-sm">
									Create Free Account
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</Link>
						</div>
					</div>

					<div className="flex flex-col justify-between rounded-2xl border bg-card p-8">
						<div className="space-y-6">
							<div>
								<span className="inline-block rounded-full border px-3 py-0.5 font-semibold text-muted-foreground text-xs">
									Self-hosted
								</span>
								<h3 className="mt-3 font-bold text-xl">Docker Compose</h3>
								<p className="mt-1 text-muted-foreground text-sm">
									Your infrastructure, your data. No vendor lock-in.
								</p>
							</div>

							<div className="rounded-xl border border-border/60 bg-muted/40 p-4">
								<p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
									Up in under 2 minutes
								</p>
								<pre className="overflow-x-auto font-mono text-foreground text-xs leading-relaxed">
									<code>{DOCKER_SNIPPET}</code>
								</pre>
							</div>

							<ul className="space-y-2 text-muted-foreground text-sm">
								<li className="flex items-center gap-2">
									<Check className="h-3.5 w-3.5 shrink-0 text-primary" />
									Full PostgreSQL database — your data, your rules
								</li>
								<li className="flex items-center gap-2">
									<Check className="h-3.5 w-3.5 shrink-0 text-primary" />
									Unlimited projects, members, and tasks
								</li>
								<li className="flex items-center gap-2">
									<Check className="h-3.5 w-3.5 shrink-0 text-primary" />
									MIT license — fork, modify, deploy
								</li>
							</ul>
						</div>

						<div className="mt-8">
							<a
								className="block w-full"
								href="https://github.com/Samuteg/TaskNest"
								rel="noopener noreferrer"
								target="_blank"
							>
								<Button
									className="h-11 w-full font-semibold text-sm"
									variant="outline"
								>
									<Code2 className="mr-2 h-4 w-4" />
									View on GitHub
								</Button>
							</a>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
