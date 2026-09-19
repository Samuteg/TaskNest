import { Button } from "@TaskNest/ui/components/button";
import { Code2, FolderKanban } from "lucide-react";

import { AuthCta } from "./auth-cta";

export function CtaSection() {
	return (
		<section className="py-20 md:py-28">
			<div className="container mx-auto max-w-5xl px-4">
				<div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card">
					<div
						aria-hidden="true"
						className="pointer-events-none absolute top-0 left-1/2 -z-0 h-64 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
					/>

					<div className="relative z-10 flex flex-col items-center space-y-8 px-8 py-16 text-center md:py-20">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
							<FolderKanban className="h-6 w-6" />
						</div>

						<div className="space-y-3">
							<h2 className="font-extrabold text-3xl tracking-tight sm:text-4xl md:text-5xl">
								Ready to ship faster?
							</h2>
							<p className="mx-auto max-w-xl text-muted-foreground text-sm sm:text-base">
								Try the demo in seconds, or clone the repo and self-host in
								under 2 minutes with Docker Compose.
							</p>
						</div>

						<div className="flex w-full max-w-sm flex-col gap-3 sm:flex-row">
							<div className="flex-1">
								<AuthCta />
							</div>
							<a
								className="flex-1"
								href="https://github.com/Samuteg/TaskNest"
								rel="noopener noreferrer"
								target="_blank"
							>
								<Button
									className="h-11 w-full gap-2 font-semibold text-sm"
									variant="outline"
								>
									<Code2 className="h-4 w-4" />
									<span>View on GitHub</span>
								</Button>
							</a>
						</div>

						<p className="text-muted-foreground text-xs">
							MIT license · Docker Compose included · No vendor lock-in
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
