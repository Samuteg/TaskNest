import { Button } from "@TaskNest/ui/components/button";
import { ArrowRight, FolderKanban, ShieldCheck } from "lucide-react";

export function CtaSection() {
	return (
		<section className="py-24">
			<div className="container mx-auto max-w-5xl px-4">
				<div className="relative overflow-hidden rounded-3xl border bg-primary text-primary-foreground">
					<div className="absolute top-0 left-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
					<div className="absolute right-0 bottom-0 h-64 w-64 translate-x-1/2 translate-y-1/2 rounded-full bg-black/20 blur-3xl" />

					<div className="relative z-10 flex flex-col items-center space-y-8 px-8 py-16 text-center md:py-24">
						<div className="flex items-center justify-center gap-3">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
								<FolderKanban className="h-6 w-6" />
							</div>
						</div>

						<h2 className="max-w-2xl font-extrabold text-3xl tracking-tight sm:text-4xl md:text-5xl">
							TaskNest is open-source
						</h2>

						<p className="max-w-xl text-sm opacity-90 sm:text-base">
							Clone the repo, configure your PostgreSQL database, and run it
							yourself. Docker Compose included — under 2 minutes to get
							running.
						</p>

						<div className="flex w-full max-w-sm flex-col gap-3 pt-2 sm:flex-row">
							<a
								href="https://github.com/Samuteg/TaskNest"
								rel="noopener noreferrer"
								target="_blank"
							>
								<Button
									className="h-12 w-full gap-2 bg-white font-semibold text-primary text-sm shadow-lg hover:bg-white/90"
									size="lg"
								>
									<span>View on GitHub</span>
									<ArrowRight className="h-4 w-4" />
								</Button>
							</a>
						</div>

						<div className="flex items-center gap-2 pt-4 font-medium text-xs opacity-80">
							<ShieldCheck className="h-4 w-4" />
							<span>Docker Compose · PostgreSQL · No vendor lock-in</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
