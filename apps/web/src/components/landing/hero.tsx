import { Button } from "@TaskNest/ui/components/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Play } from "lucide-react";

export function Hero() {
	return (
		<section className="relative overflow-hidden py-20 md:py-32">
			{/* Subtle background glow */}
			<div className="absolute top-0 left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />

			<div className="container mx-auto max-w-5xl space-y-12 px-4 text-center">
				{/* Eyebrow */}
				<div className="inline-flex items-center gap-2 rounded-full border bg-background/50 px-3 py-1 font-medium text-muted-foreground text-xs shadow-xs backdrop-blur-xs">
					<span className="relative flex h-2 w-2">
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
						<span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
					</span>
					<span>New: TaskNest v1.0 is now generally available</span>
				</div>

				{/* Headline */}
				<h1 className="font-extrabold text-4xl leading-[1.1] tracking-tight sm:text-6xl md:text-7xl">
					The Developer-First <br className="hidden md:block" />
					Task Management System
				</h1>

				{/* Subheadline */}
				<p className="mx-auto max-w-2xl text-base text-muted-foreground leading-relaxed sm:text-xl md:text-2xl">
					Built with speed and strict code quality in mind. Collaborate
					seamlessly with team members via role-based access, Kanban views, and
					instant real-time status updates.
				</p>

				{/* CTAs */}
				<div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row">
					<Link to="/login">
						<Button
							className="h-12 gap-2 px-8 text-base shadow-lg transition-all hover:shadow-xl"
							size="lg"
						>
							<span>Start Building for Free</span>
							<ArrowRight className="h-4 w-4" />
						</Button>
					</Link>
					<Link to="/login">
						<Button
							className="h-12 gap-2 px-8 text-base"
							size="lg"
							variant="outline"
						>
							<Play className="h-4 w-4 fill-current" />
							<span>Watch the Overview</span>
						</Button>
					</Link>
				</div>

				{/* Social proof stats */}
				<div className="mx-auto grid max-w-2xl grid-cols-3 gap-6 border-border/50 border-t pt-16">
					<div className="space-y-1">
						<div className="font-extrabold text-2xl text-foreground tracking-tight sm:text-3xl">
							40%
						</div>
						<div className="font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
							Faster Delivery
						</div>
					</div>
					<div className="space-y-1 border-border/50 border-x px-4">
						<div className="font-extrabold text-2xl text-foreground tracking-tight sm:text-3xl">
							10K+
						</div>
						<div className="font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
							Tasks Managed Weekly
						</div>
					</div>
					<div className="space-y-1">
						<div className="font-extrabold text-2xl text-foreground tracking-tight sm:text-3xl">
							100%
						</div>
						<div className="font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
							Open-Source Stack
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
