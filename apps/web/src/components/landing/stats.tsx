const STACK = [
	{
		detail: "Frontend framework",
		name: "React 19",
	},
	{
		detail: "Type-safe routing",
		name: "TanStack Router",
	},
	{
		detail: "Server state management",
		name: "TanStack Query",
	},
	{
		detail: "Database",
		name: "PostgreSQL",
	},
	{
		detail: "Runtime & bundler",
		name: "Bun",
	},
	{
		detail: "Type-safe API layer",
		name: "oRPC",
	},
] as const;

export function Stats() {
	return (
		<section className="border-y bg-muted/20 py-16">
			<div className="container mx-auto max-w-6xl space-y-12 px-4">
				<div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
					{STACK.map((tech) => (
						<div className="group space-y-1 text-center" key={tech.name}>
							<div className="font-bold text-foreground text-lg tracking-tight transition-transform group-hover:scale-105 sm:text-xl">
								{tech.name}
							</div>
							<div className="text-[11px] text-muted-foreground">
								{tech.detail}
							</div>
						</div>
					))}
				</div>

				<div className="border-t pt-8 text-center">
					<p className="font-semibold text-muted-foreground text-xs uppercase tracking-widest">
						100% open-source stack · Self-hostable with Docker
					</p>
				</div>
			</div>
		</section>
	);
}
