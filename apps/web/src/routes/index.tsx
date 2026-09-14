import { createFileRoute } from "@tanstack/react-router";

import { CtaSection } from "@/components/landing/cta-section";
import { FAQ } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { InteractivePreview } from "@/components/landing/interactive-preview";
import { Pricing } from "@/components/landing/pricing";
import { Stats } from "@/components/landing/stats";
import { Testimonials } from "@/components/landing/testimonials";
import { Workflow } from "@/components/landing/workflow";

export const Route = createFileRoute("/")({
	component: LandingPage,
});

function LandingPage() {
	return (
		<div className="flex min-h-full flex-col bg-background text-foreground">
			<main className="flex-1">
				<Hero />
				<InteractivePreview />
				<Stats />
				<Features />
				<Workflow />
				<Testimonials />
				<Pricing />
				<FAQ />
				<CtaSection />
			</main>
			<Footer />
		</div>
	);
}
