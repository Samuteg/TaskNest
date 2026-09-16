import Link from "next/link";

export default function HomePage() {
	return (
		<div className="flex flex-1 flex-col items-center justify-center text-center">
			<h1 className="mb-4 font-bold text-4xl">TaskNest Docs</h1>
			<p className="mb-8 max-w-lg text-fd-muted-foreground text-lg">
				Documentação do backend — Fastify + oRPC + Drizzle + Better-Auth.
			</p>
			<Link
				className="rounded-lg bg-fd-primary px-6 py-3 font-medium text-fd-primary-foreground transition-colors hover:opacity-90"
				href="/docs"
			>
				Ler a documentação
			</Link>
		</div>
	);
}
