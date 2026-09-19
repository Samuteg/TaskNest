import { Button } from "@TaskNest/ui/components/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Code2 } from "lucide-react";

import { InteractivePreview } from "./interactive-preview";

export function Hero() {
	return (
		<section className="relative overflow-hidden py-20 md:py-28">
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 -z-10 [background-image:linear-gradient(to_right,hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.4)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black_40%,transparent_100%)]"
			/>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/8 blur-[100px] motion-safe:animate-pulse-slow"
			/>

			<div className="container mx-auto max-w-5xl space-y-16 px-4 text-center">
				<div className="space-y-8">
					<div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 font-medium text-muted-foreground text-xs backdrop-blur-sm">
						<span className="h-1.5 w-1.5 rounded-full bg-green-500" />
						<span>Open-source · Docker · PostgreSQL</span>
					</div>

					<h1 className="font-extrabold text-4xl leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
						Ship projects faster with
						<br className="hidden sm:block" />
						<span className="text-primary"> real-time Kanban</span>
					</h1>

					<p className="mx-auto max-w-xl text-base text-muted-foreground leading-relaxed sm:text-lg">
						Role-based access, real-time sync, and full self-hosting in under 2
						minutes. Free for your whole team — no vendor lock-in.
					</p>

					<div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
						<Link to="/login">
							<Button
								className="h-11 gap-2 px-8 font-semibold text-sm shadow-md"
								size="lg"
							>
								<span>Try the Demo</span>
								<ArrowRight className="h-4 w-4" />
							</Button>
						</Link>
						<a
							href="https://github.com/Samuteg/TaskNest"
							rel="noopener noreferrer"
							target="_blank"
						>
							<Button
								className="h-11 gap-2 px-8 text-sm"
								size="lg"
								variant="outline"
							>
								<Code2 className="h-4 w-4" />
								<span>View on GitHub</span>
							</Button>
						</a>
					</div>
				</div>

				<InteractivePreview />
			</div>
		</section>
	);
}
