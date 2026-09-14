const STATS = [
	{
		detail: "Mission-critical reliability",
		label: "Uptime SLA",
		value: "99.99%",
	},
	{
		detail: "Powered by Bun & PostgreSQL",
		label: "API Latency",
		value: "< 50ms",
	},
	{
		detail: "Reported by agile engineering teams",
		label: "Faster Delivery",
		value: "40%",
	},
	{
		detail: "Completed seamlessly every week",
		label: "Tasks Managed",
		value: "10,000+",
	},
] as const;

const TRUSTED_LOGOS = [
	"Acme Corp",
	"CloudScale",
	"DevFlow",
	"HyperStack",
	"NextWave",
	"VectorOps",
] as const;

export function Stats() {
	return (
		<section className="border-y bg-muted/20 py-16">
			<div className="container mx-auto max-w-6xl space-y-12 px-4">
				<div className="grid grid-cols-2 gap-6 md:grid-cols-4">
					{STATS.map((stat) => (
						<div className="group space-y-1 text-center" key={stat.label}>
							<div className="font-extrabold font-mono text-3xl text-primary tracking-tight transition-transform group-hover:scale-105 sm:text-4xl">
								{stat.value}
							</div>
							<div className="font-semibold text-xs sm:text-sm">
								{stat.label}
							</div>
							<div className="text-[11px] text-muted-foreground">
								{stat.detail}
							</div>
						</div>
					))}
				</div>

				<div className="space-y-6 border-t pt-8 text-center">
					<p className="font-semibold text-muted-foreground text-xs uppercase tracking-widest">
						Powering fast-moving engineering & product teams worldwide
					</p>
					<div className="flex flex-wrap items-center justify-center gap-8 opacity-70 md:gap-12">
						{TRUSTED_LOGOS.map((name) => (
							<span
								className="cursor-default font-extrabold text-base text-muted-foreground/60 uppercase tracking-widest transition-colors hover:text-foreground"
								key={name}
							>
								{name}
							</span>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
