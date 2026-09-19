import { createFileRoute } from "@tanstack/react-router";

import { CtaSection } from "@/components/landing/cta-section";
import { FAQ } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Pricing } from "@/components/landing/pricing";
import { ProofStrip } from "@/components/landing/proof-strip";

export const Route = createFileRoute("/")({
	component: LandingPage,
	head: () => ({
		meta: [
			{
				title: "TaskNest — Real-time Kanban for engineering teams",
			},
			{
				name: "description",
				content:
					"Open-source task manager built for speed. Real-time Kanban sync, role-based access, and 2-minute Docker self-hosting.",
			},
			{
				property: "og:title",
				content: "TaskNest — Real-time Kanban for engineering teams",
			},
			{
				property: "og:description",
				content:
					"Open-source task manager built for speed. Real-time Kanban sync, role-based access, and 2-minute Docker self-hosting.",
			},
			{
				property: "og:type",
				content: "website",
			},
			{
				name: "twitter:card",
				content: "summary_large_image",
			},
		],
	}),
});

function LandingPage() {
	return (
		<div className="flex min-h-full flex-col bg-background text-foreground">
			<main className="flex-1">
				<Hero />
				<ProofStrip />
				<Features />
				<Pricing />
				<FAQ />
				<CtaSection />
			</main>
			<Footer />
		</div>
	);
}
