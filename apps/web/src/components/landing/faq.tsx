import { Badge } from "@TaskNest/ui/components/badge";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { useState } from "react";

const FAQS = [
	{
		answer:
			"Yes! The Starter plan is entirely free forever and includes unlimited tasks, 5 active projects, and up to 3 team members per project. No credit card is required to sign up.",
		question: "Is TaskNest completely free to use?",
	},
	{
		answer:
			"You can invite users directly via their email address from the project settings. They receive an automated invite token valid for 7 days. Once they sign up or log in, they are automatically assigned the role (Admin or Member) you chose.",
		question: "How does team member invitation work?",
	},
	{
		answer:
			"Only the project Owner can delete a project. To prevent accidental deletions, TaskNest places the action inside a dedicated 'Danger Zone' tab and requires a confirmation dialog.",
		question: "Can I delete a project with active tasks and members?",
	},
	{
		answer:
			"TaskNest utilizes modern, session-based authentication powered by Better Auth. It includes secure, HTTP-only cookies, CSRF protection, and robust session management with trusted origin handling.",
		question: "What kind of authentication does TaskNest use?",
	},
	{
		answer:
			"Yes! Tasks have an optional 'Assignee' field. You can assign a task to any member of the project directly when creating or editing it. The Kanban board visually displays the avatar of the assignee.",
		question: "Can tasks be assigned to specific team members?",
	},
	{
		answer:
			"Invitations are automatically marked as expired after 7 days. If a user tries to accept an expired invite, they are shown a warning, and the project admin can simply send a fresh invitation.",
		question: "What happens when an invitation expires?",
	},
] as const;

export function FAQ() {
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	const toggle = (idx: number) => {
		setOpenIndex((prev) => (prev === idx ? null : idx));
	};

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
						Everything you need to know about TaskNest
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
