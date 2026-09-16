import { Link } from "@tanstack/react-router";
import { Code2, FolderKanban } from "lucide-react";

export function Footer() {
	return (
		<footer className="border-t bg-card py-16">
			<div className="container mx-auto max-w-6xl space-y-12 px-4">
				<div className="grid grid-cols-2 gap-8 md:grid-cols-3">
					<div className="col-span-2 space-y-4 md:col-span-1">
						<Link className="flex items-center gap-2" to="/">
							<FolderKanban className="h-6 w-6 text-primary" />
							<span className="font-bold text-lg">TaskNest</span>
						</Link>
						<p className="max-w-sm text-muted-foreground text-xs leading-relaxed">
							Task manager for engineering teams. Built on React 19, TanStack,
							and PostgreSQL. Open-source and self-hostable.
						</p>
					</div>

					<div className="space-y-3">
						<h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
							Product
						</h4>
						<ul className="space-y-2.5 text-muted-foreground text-xs">
							<li>
								<Link
									className="transition-colors hover:text-foreground"
									to="/"
								>
									Features
								</Link>
							</li>
							<li>
								<Link
									className="transition-colors hover:text-foreground"
									to="/"
								>
									Pricing
								</Link>
							</li>
							<li>
								<Link
									className="transition-colors hover:text-foreground"
									to="/"
								>
									FAQ
								</Link>
							</li>
						</ul>
					</div>

					<div className="space-y-3">
						<h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
							Open Source
						</h4>
						<ul className="space-y-2.5 text-muted-foreground text-xs">
							<li>
								<a
									className="flex items-center gap-1.5 transition-colors hover:text-foreground"
									href="https://github.com/Samuteg/TaskNest"
									rel="noopener noreferrer"
									target="_blank"
								>
									<Code2 className="h-3.5 w-3.5" />
									GitHub
								</a>
							</li>
							<li>
								<a
									className="flex items-center gap-1.5 transition-colors hover:text-foreground"
									href="https://github.com/Samuteg/TaskNest/issues"
									rel="noopener noreferrer"
									target="_blank"
								>
									Report a Bug
								</a>
							</li>
							<li>
								<a
									className="flex items-center gap-1.5 transition-colors hover:text-foreground"
									href="https://github.com/Samuteg/TaskNest"
									rel="noopener noreferrer"
									target="_blank"
								>
									Contribute
								</a>
							</li>
						</ul>
					</div>
				</div>

				<div className="border-t pt-8 text-center">
					<p className="text-[11px] text-muted-foreground">
						&copy; {new Date().getFullYear()} TaskNest. Open-source under MIT
						License.
					</p>
				</div>
			</div>
		</footer>
	);
}
