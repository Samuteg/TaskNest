import { Badge } from "@TaskNest/ui/components/badge";
import { Button } from "@TaskNest/ui/components/button";
import { Card, CardContent } from "@TaskNest/ui/components/card";
import { Code2, MessageSquare } from "lucide-react";

export function Testimonials() {
	return (
		<section className="border-y bg-muted/20 py-24">
			<div className="container mx-auto max-w-6xl space-y-12 px-4">
				<div className="mx-auto max-w-2xl space-y-4 text-center">
					<Badge className="px-3 py-1 text-xs" variant="outline">
						Building in Public
					</Badge>
					<h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
						Open development, transparent progress
					</h2>
					<p className="text-muted-foreground text-sm">
						TaskNest is built openly. Follow the development, report bugs, and
						shape what gets built next.
					</p>
				</div>

				<div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
					<Card className="border bg-card shadow-xs transition-shadow hover:shadow-md">
						<CardContent className="space-y-4 p-6">
							<div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/10 text-foreground">
								<Code2 className="h-5 w-5" />
							</div>
							<h3 className="font-semibold text-base">Follow the Code</h3>
							<p className="text-muted-foreground text-xs leading-relaxed">
								Every commit is public. See the architecture decisions, the
								trade-offs, and the real implementation — not just polished
								marketing.
							</p>
							<a
								href="https://github.com/Samuteg/TaskNest"
								rel="noopener noreferrer"
								target="_blank"
							>
								<Button className="h-9 gap-2 text-xs" variant="outline">
									<Code2 className="h-3.5 w-3.5" />
									View on GitHub
								</Button>
							</a>
						</CardContent>
					</Card>

					<Card className="border bg-card shadow-xs transition-shadow hover:shadow-md">
						<CardContent className="space-y-4 p-6">
							<div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/10 text-foreground">
								<MessageSquare className="h-5 w-5" />
							</div>
							<h3 className="font-semibold text-base">Shape the Roadmap</h3>
							<p className="text-muted-foreground text-xs leading-relaxed">
								Have a feature request? Found a bug? Open an issue. Your input
								directly influences what gets built.
							</p>
							<a
								href="https://github.com/Samuteg/TaskNest/issues"
								rel="noopener noreferrer"
								target="_blank"
							>
								<Button className="h-9 gap-2 text-xs" variant="outline">
									<MessageSquare className="h-3.5 w-3.5" />
									Open an Issue
								</Button>
							</a>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
}
