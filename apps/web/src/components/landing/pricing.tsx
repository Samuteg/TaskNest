import { Badge } from "@TaskNest/ui/components/badge";
import { Button } from "@TaskNest/ui/components/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@TaskNest/ui/components/card";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

const TIERS = [
	{
		badge: "Free",
		cta: "Start Free",
		ctaVariant: "outline" as const,
		description:
			"Ideal for individual developers, side projects, and open-source contributors.",
		features: [
			"Up to 5 active projects",
			"Unlimited tasks and Kanban boards",
			"Up to 3 team members per project",
			"Standard priority & due date tags",
			"Community support",
		],
		highlighted: false,
		name: "Starter / Community",
		period: "forever free",
		price: "$0",
	},
	{
		badge: "Most Popular",
		cta: "Get Started Free",
		ctaVariant: "default" as const,
		description:
			"For fast-moving software startups and engineering teams needing full power.",
		features: [
			"Unlimited projects & workspaces",
			"Unlimited team members & invites",
			"Role-based access control (Admin/Member)",
			"Priority task scheduling & SLA badges",
			"Automated project deletion protections",
			"Direct priority email support",
		],
		highlighted: true,
		name: "Pro Team",
		period: "per user / month",
		price: "$12",
	},
	{
		badge: "Scale",
		cta: "Contact Sales",
		ctaVariant: "outline" as const,
		description:
			"For scaling organizations requiring dedicated infrastructure and governance.",
		features: [
			"Everything in Pro Team",
			"Dedicated PostgreSQL instance isolation",
			"Custom SSO / SAML integrations",
			"Audit logging & compliance exports",
			"99.99% uptime SLA guarantee",
			"Dedicated account manager",
		],
		highlighted: false,
		name: "Enterprise",
		period: "tailored billing",
		price: "Custom",
	},
] as const;

export function Pricing() {
	return (
		<section className="border-y bg-muted/20 py-24">
			<div className="container mx-auto max-w-6xl space-y-16 px-4">
				<div className="mx-auto max-w-2xl space-y-4 text-center">
					<Badge className="px-3 py-1 text-xs" variant="outline">
						Predictable Pricing
					</Badge>
					<h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
						Transparent plans for teams of all sizes
					</h2>
					<p className="text-muted-foreground text-sm sm:text-base">
						Start completely free. Upgrade only when your team needs advanced
						collaboration.
					</p>
				</div>

				<div className="grid items-stretch gap-8 lg:grid-cols-3">
					{TIERS.map((tier) => (
						<Card
							className={`relative flex flex-col justify-between bg-card ${
								tier.highlighted
									? "z-10 scale-105 border-2 border-primary shadow-xl"
									: "border shadow-xs"
							}`}
							key={tier.name}
						>
							{tier.highlighted && (
								<div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
									<Badge className="bg-primary px-3 py-0.5 text-primary-foreground text-xs">
										{tier.badge}
									</Badge>
								</div>
							)}

							<CardHeader className="space-y-3 pb-6">
								<div>
									<h3 className="font-bold text-lg">{tier.name}</h3>
									<p className="mt-1 min-h-[2.5rem] text-muted-foreground text-xs">
										{tier.description}
									</p>
								</div>
								<div className="flex items-baseline gap-1 pt-2">
									<span className="font-extrabold font-mono text-4xl tracking-tight">
										{tier.price}
									</span>
									<span className="text-muted-foreground text-xs">
										{tier.period}
									</span>
								</div>
							</CardHeader>

							<CardContent className="flex-1 space-y-3 border-t pt-6">
								<p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Included Features:
								</p>
								<ul className="space-y-2.5">
									{tier.features.map((feature) => (
										<li
											className="flex items-start gap-2.5 text-xs"
											key={feature}
										>
											<div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
												<Check className="h-3 w-3" />
											</div>
											<span>{feature}</span>
										</li>
									))}
								</ul>
							</CardContent>

							<CardFooter className="border-t pt-6">
								<Link className="w-full" to="/login">
									<Button
										className="h-10 w-full font-semibold text-xs"
										variant={tier.ctaVariant}
									>
										{tier.cta}
									</Button>
								</Link>
							</CardFooter>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
