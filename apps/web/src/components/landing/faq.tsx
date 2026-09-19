import { Badge } from "@TaskNest/ui/components/badge";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useCallback, useState } from "react";

const FAQS = [
	{
		answer:
			"Yes, 100% free with no credit card required. Up to 5 projects, unlimited tasks, and 3 members per project.",
		question: "Is TaskNest really free?",
	},
	{
		answer:
			"Yes. Docker Compose files are included in the repository. Clone the repo, copy the .env examples, and run `docker compose up`. Web, server, and PostgreSQL spin up in under 2 minutes.",
		question: "Can I self-host TaskNest?",
	},
	{
		answer:
			"Not yet. TaskNest is currently a web app optimized for desktop and tablet browsers. PWA and mobile support are on the roadmap.",
		question: "Is there a mobile app?",
	},
	{
		answer:
			"No. TaskNest requires an active server connection for real-time sync between team members.",
		question: "Does it work offline?",
	},
	{
		answer:
			"Not currently. Importers for Notion, Todoist, and Trello are planned. Open an issue on GitHub if you need a specific one.",
		question: "Can I import data from Notion or Todoist?",
	},
	{
		answer:
			"Invite by email from project settings. Members receive a token valid for 7 days and can be assigned Owner, Admin, or Member roles.",
		question: "How do team invitations work?",
	},
] as const;

const FAQ_JSON_LD = {
	"@context": "https://schema.org",
	"@type": "FAQPage",
	mainEntity: FAQS.map((faq) => ({
		"@type": "Question",
		acceptedAnswer: { "@type": "Answer", text: faq.answer },
		name: faq.question,
	})),
};

export function FAQ() {
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	const toggle = useCallback((idx: number) => {
		setOpenIndex((prev) => (prev === idx ? null : idx));
	}, []);

	return (
		<section className="border-b bg-background py-20 md:py-28" id="faq">
			<script type="application/ld+json">{JSON.stringify(FAQ_JSON_LD)}</script>

			<div className="container mx-auto max-w-4xl space-y-12 px-4">
				<div className="space-y-4 text-center">
					<Badge
						className="inline-flex gap-1.5 px-3 py-1 text-xs"
						variant="outline"
					>
						<HelpCircle className="h-3.5 w-3.5" />
						Frequently Asked Questions
					</Badge>
					<h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
						Honest answers to common questions
					</h2>
				</div>

				<div className="space-y-2">
					{FAQS.map((faq, idx) => {
						const isOpen = openIndex === idx;
						const panelId = `faq-panel-${idx}`;
						return (
							<div
								className={`rounded-xl border transition-all ${
									isOpen
										? "border-primary/20 bg-card shadow-sm"
										: "bg-muted/30 hover:bg-muted/50"
								}`}
								key={faq.question}
							>
								<button
									aria-controls={panelId}
									aria-expanded={isOpen}
									className="flex w-full items-center justify-between p-5 text-left"
									onClick={() => toggle(idx)}
									type="button"
								>
									<h3 className="pr-8 font-semibold text-sm sm:text-base">
										{faq.question}
									</h3>
									<ChevronDown
										className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : ""}`}
									/>
								</button>
								{isOpen && (
									<div className="px-5 pt-0 pb-5" id={panelId}>
										<p className="text-muted-foreground text-sm leading-relaxed">
											{faq.answer}
										</p>
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
