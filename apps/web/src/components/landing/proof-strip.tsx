export function ProofStrip() {
	const stack = [
		"React 19",
		"TanStack Router/Query",
		"oRPC + Zod",
		"PostgreSQL",
		"Bun",
		"Docker",
	];

	return (
		<div className="border-y bg-muted/20 py-4">
			<div className="container mx-auto max-w-6xl px-4">
				<p className="text-center font-medium text-muted-foreground text-xs uppercase tracking-widest">
					{stack.join(" · ")}
				</p>
			</div>
		</div>
	);
}
