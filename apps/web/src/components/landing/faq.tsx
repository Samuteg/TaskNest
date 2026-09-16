import { Badge } from "@TaskNest/ui/components/badge";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { useCallback, useState } from "react";

const FAQS = [
	{
		answer:
			"Yes, 100% free with no credit card required. Up to 5 projects, unlimited tasks, and 3 members per project.",
		question: "Is TaskNest really free?",
	},
	{
		answer:
			"Yes! Docker Compose files are included in the repository. You can spin up the web frontend, server API, and connect your own PostgreSQL database in under 2 minutes.",
		question: "Can I self-host TaskNest?",
	},
	{
		answer:
			"Not yet. TaskNest is currently a web application (SPA) optimized for desktop and tablet browsers. PWA and mobile support are on the roadmap.",
		question: "Is there a mobile app?",
	},
	{
		answer:
			"No, TaskNest requires an active server connection for real-time synchronization between team members.",
		question: "Does it work offline?",
	},
	{
		answer:
			"Not currently. Import tools for Notion, Todoist, and Trello are planned for future releases. Open an issue on GitHub if you need a specific importer.",
		question: "Can I import data from Notion or Todoist?",
	},
	{
		answer:
			"You invite members by email address from project settings. They receive an email token valid for 7 days. You can assign them Owner, Admin, or Member roles.",
		question: "How do team invitations work?",
	},
] as const;

export function FAQ() {
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	const toggle = useCallback((idx: number) => {
		setOpenIndex((prev) => (prev === idx ? null : idx));
	}, []);

	return (
		<section className="border-b bg-background py-24">
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

				<div className="space-y-3">
					{FAQS.map((faq, idx) => {
						const isOpen = openIndex === idx;
						return (
							<div
								className={`rounded-xl border transition-all ${
									isOpen
										? "border-primary/20 bg-card shadow-md"
										: "bg-muted/30 hover:bg-muted/50"
								}`}
								key={faq.question}
							>
								<button
									aria-expanded={isOpen}
									className="flex w-full items-center justify-between p-5 text-left"
									onClick={() => toggle(idx)}
									type="button"
								>
									<h3 className="pr-8 font-semibold text-sm sm:text-base">
										{faq.question}
									</h3>
									{isOpen ? (
										<ChevronUp className="h-5 w-5 shrink-0 text-primary" />
									) : (
										<ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
									)}
								</button>
								{isOpen && (
									<div className="px-5 pt-0 pb-5">
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
