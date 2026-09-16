import { Button } from "@TaskNest/ui/components/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Code2 } from "lucide-react";

export function Hero() {
	return (
		<section className="relative overflow-hidden py-20 md:py-32">
			<div className="absolute top-0 left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />

			<div className="container mx-auto max-w-5xl space-y-12 px-4 text-center">
				<div className="inline-flex items-center gap-2 rounded-full border bg-background/50 px-3 py-1 font-medium text-muted-foreground text-xs shadow-xs backdrop-blur-xs">
					<span className="relative flex h-2 w-2">
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
						<span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
					</span>
					<span>Open-source · Self-hostable · Type-safe</span>
				</div>

				<h1 className="font-extrabold text-4xl leading-[1.1] tracking-tight sm:text-6xl md:text-7xl">
					Task manager for <br className="hidden md:block" />
					engineering teams
				</h1>

				<p className="mx-auto max-w-2xl text-base text-muted-foreground leading-relaxed sm:text-xl md:text-2xl">
					Kanban boards with real-time sync. Role-based access for teams. Built
					on React 19, TanStack, and PostgreSQL. Self-hostable with Docker.
				</p>

				<div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row">
					<a
						href="https://github.com/Samuteg/TaskNest"
						rel="noopener noreferrer"
						target="_blank"
					>
						<Button
							className="h-12 gap-2 px-8 text-base shadow-lg transition-all hover:shadow-xl"
							size="lg"
						>
							<Code2 className="h-4 w-4" />
							<span>View on GitHub</span>
						</Button>
					</a>
					<Link to="/login">
						<Button
							className="h-12 gap-2 px-8 text-base"
							size="lg"
							variant="outline"
						>
							<span>Try the Demo</span>
							<ArrowRight className="h-4 w-4" />
						</Button>
					</Link>
				</div>
			</div>
		</section>
	);
}
